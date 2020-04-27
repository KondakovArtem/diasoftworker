import {createReducer, createAction, Action} from 'typesafe-actions';
import {startSchedule, stopScheduler} from '@app/core/scheduler';
import {ThunkAction} from '../store';
import {isEmpty, cloneDeep} from 'lodash-es';
import { CLEAR_DATA } from '../common/common.ducks';

export const SET_AUTO_SCHEDULER = '@scheduler/SET_AUTO_SCHEDULER';
export const FILL_DAY_DATA = '@scheduler/FILL_DAY_DATA';
export const SET_ACTIVE_DAY = '@scheduler/SET_ACTIVE_DAY';
export const SET_DAY_TIME = '@scheduler/SET_DAY_TIME';

export interface IDayTask {
  startTime: string;
  endTime: string;
  active: boolean;
}

/////////////////////////////////////////////
// STORE
/////////////////////////////////////////////
export interface IStore {
  isAutoScheduler: boolean;
  dayData: {
    [idx: string]: IDayTask;
  };
}

export const initialState: IStore = {
  isAutoScheduler: false,
  dayData: {
    '0': {
      active: true,
      startTime: '09:00',
      endTime: '18:00',
    },
    '1': {
      active: true,
      startTime: '09:00',
      endTime: '18:00',
    },
    '2': {
      active: true,
      startTime: '09:00',
      endTime: '18:00',
    },
    '3': {
      active: true,
      startTime: '09:00',
      endTime: '18:00',
    },
    '4': {
      active: true,
      startTime: '09:00',
      endTime: '18:00',
    },
    '5': {
      active: false,
      startTime: '09:00',
      endTime: '18:00',
    },
    '6': {
      active: false,
      startTime: '09:00',
      endTime: '18:00',
    },
  },
};

/////////////////////////////////////////////
// ACTIONS
/////////////////////////////////////////////
const setAutoScheduler = createAction(SET_AUTO_SCHEDULER, (v: boolean) => v)();
const fillDaysData = createAction(FILL_DAY_DATA, () => {})();
const setActiveDay = createAction(SET_ACTIVE_DAY, (index: number, active: boolean) => ({
  index,
  active,
}))();
const setDayTime = createAction(SET_DAY_TIME, (index: number, key: 'startTime' | 'endTime', value: string) => ({
  index,
  key,
  value,
}))();
const clearData = createAction(CLEAR_DATA, () => {})();

export const Actions = {
  setAutoScheduler: (value: boolean): ThunkAction => async (dispatch) => {
    dispatch(setAutoScheduler(value));
    if (value) {
      startSchedule();
    } else {
      stopScheduler();
    }
  },
  onInit: (): ThunkAction => async (dispatch, getStore) => {
    const {scheduler} = getStore!();
    const {dayData} = scheduler;
    if (!dayData || isEmpty(dayData)) {
      dispatch(fillDaysData());
    }
  },
  setActiveDay: (index: number, active: boolean): ThunkAction => async (dispatch) => {
    dispatch(setActiveDay(index, active));
  },
  setDayTime: (index: number, key: 'startTime' | 'endTime', value: string): ThunkAction => async (dispatch) => {
    dispatch(setDayTime(index, key, value));
  },
};

/////////////////////////////////////////////
// REDUCERS
/////////////////////////////////////////////
export const reducer = createReducer<IStore, Action>(initialState)
  .handleAction(setAutoScheduler, (state, {payload}) => ({
    ...state,
    isAutoScheduler: payload,
  }))
  .handleAction(fillDaysData, (state) => ({
    ...state,
    dayData: cloneDeep(initialState.dayData),
  }))
  .handleAction(setActiveDay, (state, {payload}) => {
    const {active, index} = payload;
    return {
      ...state,
      dayData: {
        ...state.dayData,
        [index + '']: {
          ...state.dayData[index + ''],
          active,
        },
      },
    };
  })
  .handleAction(setDayTime, (state, {payload}) => {
    const {key, index, value} = payload;
    return {
      ...state,
      dayData: {
        ...state.dayData,
        [index + '']: {
          ...state.dayData[index + ''],
          [key]: value,
        },
      },
    };
  })
  .handleAction(clearData, () => ({
    ...initialState,
  }));
