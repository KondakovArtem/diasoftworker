import BackgroundJob from 'react-native-background-job';
import AsyncStorage from '@react-native-community/async-storage';
import {decodeAll} from '@app/redux/store';
import moment from 'moment';
import ReactNativeAN from 'react-native-alarm-notification';
import {DeviceEventEmitter} from 'react-native';

import {fetchData, setIsOnWork} from './api';

const alarmNotifData = {
  channel: 'my_channel_id',
  small_icon: 'ic_launcher',
};

export const exactJobKey = 'exactJobKey';
export const STORAGE_TIMESTAMP_KEY = 'service:timestamp';

function timeToMinutes(time: string) {
  const timeData = time.split(':');
  return parseInt(timeData[0], 10) * 60 + parseInt(timeData[1], 10);
}

function timeToDate(time: string) {
  const timeData = time.split(':');
  return moment().hour(parseInt(timeData[0], 10)).minute(parseInt(timeData[1], 10)).second(0).millisecond(0).toDate();
}

// This has to run outside of the component definition since the component is never
// instantiated when running in headless mode
BackgroundJob.register({
  jobKey: exactJobKey,
  job: async () => {
    //console.log('Start schedule');

    const {scheduler, common} = decodeAll((await AsyncStorage.getItem('persist:root')) as string);
    const {userFullName} = common;
    const lastChangeTimestamp = await AsyncStorage.getItem(STORAGE_TIMESTAMP_KEY);
    //console.log('lastChangeTimestamp=', lastChangeTimestamp);
    let lastChangeDate;
    if (lastChangeTimestamp && lastChangeTimestamp !== '') {
      lastChangeDate = moment(lastChangeTimestamp, 'x').toDate();
    }

    const {isAutoScheduler, dayData} = scheduler;
    if (isAutoScheduler) {
      const dayProps = dayData[moment().weekday() - 1 + ''] || {};
      if (dayProps.active) {
        const {startTime, endTime} = dayProps;
        const currentTimeMinutes = timeToMinutes(moment().format('HH:mm'));

        const startTimeDate = timeToDate(startTime);
        const startTimeMinutes = timeToMinutes(startTime);
        //console.log('currentTimeMinutes=', currentTimeMinutes, 'startTimeMinutes = ', startTimeMinutes);
        //console.log('startTimeDate=', startTimeDate, 'lastChangeDate = ', lastChangeDate);
        if (currentTimeMinutes >= startTimeMinutes && (!lastChangeDate || startTimeDate.getTime() >= lastChangeDate.getTime())) {
          const {isAuth, isOnWork} = await fetchData();
          if (isAuth && !isOnWork) {
            //console.log('START WORK');
            await setIsOnWork(true);
            await AsyncStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().getTime() + '');
            runStartWorkNotification({userFullName});
            return;
          }
        }
        const endTimeDate = timeToDate(moment().format('HH:mm'));
        const endTimeMinutes = timeToMinutes(endTime);
        if (currentTimeMinutes >= endTimeMinutes && (!lastChangeDate || endTimeDate.getTime() >= lastChangeDate.getTime())) {
          const {isAuth, isOnWork} = await fetchData();
          if (isAuth && isOnWork) {
            //console.log('END WORK');
            await setIsOnWork(false);
            await AsyncStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().getTime() + '');
            return;
          }
        }
      }
    }
  },
});

export const startSchedule = () => {
  BackgroundJob.schedule({
    jobKey: exactJobKey,
    period: 60000,
    timeout: 5000,
    // exact: true,
    allowExecutionInForeground: true,
    allowWhileIdle: true,
    override: true,
    persist: true,
  });
  DeviceEventEmitter.addListener('OnNotificationDismissed', async function (e) {
    const obj = JSON.parse(e);
    console.log(obj);
    clearNotification();
  });

  DeviceEventEmitter.addListener('OnNotificationOpened', async function (e) {
    const obj = JSON.parse(e);
    console.log(obj);
    clearNotification();
  });
};

export function clearNotification() {
  ReactNativeAN.deleteAlarm('startWorkAlarm');
  //Stop Alarm
  ReactNativeAN.stopAlarmSound();
}

function runStartWorkNotification(props: {userFullName: string}) {
  const {userFullName} = props;
  clearNotification();
  ReactNativeAN.scheduleAlarm({
    ...alarmNotifData,
    alarm_id: 'startWorkAlarm',
    title: 'Пора работать',
    fire_date: ReactNativeAN.parseDate(new Date(Date.now() + 1000)),
    message: `${userFullName}, пора вставать и херачить, сегодня будет прекрасный день!`,
  });
  console.log('alarm fired');
}

export const stopScheduler = () => {
  BackgroundJob.cancel({
    jobKey: exactJobKey,
  });
  (DeviceEventEmitter.removeListener as any)('OnNotificationDismissed');
  (DeviceEventEmitter.removeListener as any)('OnNotificationOpened');
};
