import React, {FC, useEffect, useState} from 'react';
import {View, FlatList, RefreshControl, StyleSheet} from 'react-native';
import {Paragraph, Caption, Checkbox, Button} from 'react-native-paper';
import {connect} from 'react-redux';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';

import {IStore as ICommonStore} from '@app/redux/common/common.ducks';
import {IStore as ISchedulerStore} from '@app/redux/scheduler/scheduler.ducks';
import {IConfiguredStore} from '@app/redux/store';
import {Actions as schedulerActions} from '@app/redux/scheduler/scheduler.ducks';
import {Actions as commonActions} from '@app/redux/common/common.ducks';
import {Actions as authActions} from '@app/redux/common/login.ducks';
import {ScheduleItemComponent} from '@app/components/schedule-item/schedule-item.component';
import {STORAGE_TIMESTAMP_KEY} from '@app/core/scheduler';

type IProps = Partial<ICommonStore> & Partial<ISchedulerStore>;

interface IHandlers {
  setAutoScheduler(value: boolean): void;
  onInitScheduler(): void;
  setActiveDay(index: number, active: boolean): void;
  setDayTime(index: number, key: 'startTime' | 'endTime', value: string): void;
  onRefresh(): void;
  signOut(): void;
}

const keyExtractor = ({idx}: any) => idx + '';

const daysTask = [{idx: 0}, {idx: 1}, {idx: 2}, {idx: 3}, {idx: 4}, {idx: 5}, {idx: 6}];

const styles = StyleSheet.create({
  propsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  schedulerContainer: {
    paddingHorizontal: 10,
  },
  checkBoxContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  propsRow: {
    flexDirection: 'row',
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export const DetailsScreenComponent: FC<IProps & IHandlers> = ({
  userFullName,
  username,
  isAutoScheduler,
  setAutoScheduler,
  onInitScheduler,
  setActiveDay,
  setDayTime,
  isRefreshing,
  lastChangeTimestamp,
  onRefresh,
  signOut,
  dayData = {},
}) => {
  useEffect(() => {
    onInitScheduler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <View style={styles.propsContainer}>
        <Caption>Параметры</Caption>
        <View style={styles.propsRow}>
          <View>
            <Paragraph>Имя: {userFullName}</Paragraph>
            <Paragraph>Логин: {username}</Paragraph>
          </View>
          <View style={styles.buttonContainer}>
            <Button onPress={signOut} mode="outlined">
              Выйти
            </Button>
          </View>
        </View>
        {lastChangeTimestamp && <Paragraph>Дата последнего изменения {moment(lastChangeTimestamp, 'x').format('DD.MM.YYYY HH:mm:ss')}</Paragraph>}
      </View>
      <View>
        <View style={styles.schedulerContainer}>
          <View style={styles.checkBoxContainer}>
            <Checkbox status={isAutoScheduler ? 'checked' : 'unchecked'} onPress={() => setAutoScheduler(!isAutoScheduler)} />
            <Caption>Автоматическое расписание</Caption>
          </View>
          {isAutoScheduler ? (
            <FlatList
              refreshControl={<RefreshControl refreshing={isRefreshing!} onRefresh={onRefresh} />}
              data={daysTask}
              keyExtractor={keyExtractor}
              renderItem={({item}) => {
                const data = dayData![item.idx + ''] || {};
                return (
                  <ScheduleItemComponent index={item.idx} onChangeActive={setActiveDay} onChangeTime={setDayTime}>
                    {data}
                  </ScheduleItemComponent>
                );
              }}
            />
          ) : (
            <></>
          )}
        </View>
      </View>
    </>
  );
};

export const DetailsScreen = connect<IProps, IHandlers, {}, IConfiguredStore>(
  ({common, scheduler}) => {
    return {
      ...common,
      ...scheduler,
    };
  },
  {
    setAutoScheduler: schedulerActions.setAutoScheduler,
    onInitScheduler: schedulerActions.onInit,
    setActiveDay: schedulerActions.setActiveDay,
    setDayTime: schedulerActions.setDayTime,
    onRefresh: commonActions.refreshData,
    signOut: authActions.signOut,
  },
)(DetailsScreenComponent);
