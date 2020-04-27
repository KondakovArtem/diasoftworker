import React, {FC, useState} from 'react';
import {List, Checkbox} from 'react-native-paper';
import {View, Text} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {IDayTask} from '@app/redux/scheduler/scheduler.ducks';
import moment from 'moment';

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

interface IProps {
  children: IDayTask;
  index: number;
}

interface IHandlers {
  onChangeActive(index: number, value: boolean): void;
  onChangeTime(index: number, ket: string, value: string): void;
}

function hourToDate(time: string) {
  console.log(moment().utcOffset());
  const value = moment(time, 'HH:mm').toDate();
  console.log(value);
  return value;
}

export const ScheduleItemComponent: FC<IProps & IHandlers> = ({children, index, onChangeActive, onChangeTime}) => {
  const {active, startTime, endTime} = children;
  const [showPicker, setShowPicker] = useState<boolean>();
  const [pickerMode, setPickerMode] = useState<'startTime' | 'endTime'>('startTime');

  return (
    <List.Item
      title=""
      style={{padding: 0, margin: 0, paddingRight: 20}}
      titleStyle={{display: 'none'}}
      description={() => (
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View>
            <Text>{DAYS[index]}</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row'}}>
            <Text
              onPress={() => {
                setPickerMode('startTime');
                setShowPicker(true);
              }}>{`${startTime} - `}</Text>
            <Text
              onPress={() => {
                setPickerMode('endTime');
                setShowPicker(true);
              }}>
              {endTime}
            </Text>
          </View>
          {showPicker && (
            <DateTimePicker
              value={hourToDate(pickerMode === 'startTime' ? startTime : endTime)}
              timeZoneOffsetInMinutes={60}
              mode="time"
              is24Hour={true}
              display="clock"
              onChange={({type}, date) => {
                setShowPicker(false);
                console.log(type);
                if (type === 'set') {
                  const newDate = moment(date).format('HH:mm');
                  onChangeTime(index, pickerMode, newDate);
                }
              }}
            />
          )}
        </View>
      )}
      left={() => <Checkbox status={active ? 'checked' : 'unchecked'} onPress={() => onChangeActive(index, !active)} />}
    />
  );
};
