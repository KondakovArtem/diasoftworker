import {createReducer, createAction, Action} from 'typesafe-actions';
import SplashScreen from 'react-native-splash-screen';

import {ICheckAuthResponse, fetchData, setIsOnWork as setIsOnWorkApi} from '@app/core/api';
import {checkAuth} from '@app/core/auth';
import {ThunkAction} from '../store';
import AsyncStorage from '@react-native-community/async-storage';
import {STORAGE_TIMESTAMP_KEY} from '@app/core/scheduler';
import {Alert} from 'react-native';

export const SET_LOGIN = '@common/SET_LOGIN';
export const SET_DATA = '@common/SET_DATA';
export const SET_IS_AUTH = '@common/SET_IS_AUTH';
export const CLEAR_DATA = '@common/CLEAR_DATA';
export const SET_IS_ON_WORK = '@common/SET_IS_ON_WORK';
export const SET_IS_REFRESHING = '@common/SET_IS_REFRESHING';
export const SET_LAST_CHANGE = '@common/SET_LAST_CHANGE';

/////////////////////////////////////////////
// STORE
/////////////////////////////////////////////
export interface IStore {
  username: string;
  password: string;
  isAuth: boolean;
  userFullName: string;
  isOnWork: boolean;
  captchaKey?: string;
  isRefreshing: boolean;
  lastChangeTimestamp?: string;
}

export const initialState: IStore = {
  username: '',
  password: '',
  isAuth: false,
  userFullName: '',
  isOnWork: false,
  captchaKey: '',
  isRefreshing: false,
  lastChangeTimestamp: '',
};

/////////////////////////////////////////////
// ACTIONS
/////////////////////////////////////////////
const setLogin = createAction(SET_LOGIN, (login: string) => login)();
const setData = createAction(SET_DATA, (data: Partial<IStore>) => data)();
const setIsAuth = createAction(SET_IS_AUTH, (v: boolean) => v)();
const clearData = createAction(CLEAR_DATA, () => {})();
const setIsOnWork = createAction(SET_IS_ON_WORK, (v: boolean) => v)();
const setIsRefreshing = createAction(SET_IS_REFRESHING, (v: boolean) => v)();
const setLastChange = createAction(SET_LAST_CHANGE, (v: string) => v)();

let refreshPromise: Promise<ICheckAuthResponse> | undefined;

export const Actions = {
  setAuthData: (data: Partial<IStore>): ThunkAction => async (dispatch) => {
    dispatch(setData(data));
  },
  onInit: (): ThunkAction => async (dispatch) => {
    const res = await checkAuth();
    if (res.isAuth) {
      dispatch(setIsAuth(res.isAuth));
      dispatch(setIsOnWork(res.isOnWork!));
    }
    SplashScreen.hide();
  },
  clear: (): ThunkAction => async (dispatch) => {
    dispatch(setData(initialState));
  },
  sendIsOnWork: (status: string): ThunkAction => async (dispatch) => {
    dispatch(setIsRefreshing(true));
    try {
      const res = await setIsOnWorkApi(status === 'rest' ? false : true);
      if (res.result === 'OK') {
        dispatch(setIsOnWork(res.isOnWork!));
      } else {
        Alert.alert(`При выполнении операции произошла ошибка ${res.result}`);
      }
    } catch (e) {}
    dispatch(setIsRefreshing(false));
  },
  refreshData: (): ThunkAction => async (dispatch) => {
    dispatch(setIsRefreshing(true));
    if (!refreshPromise) {
      refreshPromise = fetchData();
      const dataRes = await refreshPromise;
      if (!dataRes.isAuth) {
        Actions.clear()(dispatch);
        return;
      }
      dispatch(setData(dataRes));
      dispatch(setIsRefreshing(false));
      refreshPromise = undefined;
      dispatch(setLastChange((await AsyncStorage.getItem(STORAGE_TIMESTAMP_KEY)) as string));
    }
  },
};

/////////////////////////////////////////////
// REDUCERS
/////////////////////////////////////////////
export const reducer = createReducer<IStore, Action>(initialState)
  .handleAction(setLogin, (state, {payload}) => ({
    ...state,
    username: payload,
  }))
  .handleAction(setData, (state, {payload}) => ({
    ...state,
    ...payload,
  }))
  .handleAction(setIsAuth, (state, {payload}) => ({
    ...state,
    isAuth: payload,
  }))
  .handleAction(setIsOnWork, (state, {payload}) => ({
    ...state,
    isOnWork: payload,
  }))
  .handleAction(clearData, () => ({
    ...initialState,
  }))
  .handleAction(setIsRefreshing, (state, {payload}) => ({
    ...state,
    isRefreshing: payload,
  }))
  .handleAction(setLastChange, (state, {payload}) => ({
    ...state,
    lastChangeTimestamp: payload,
  }));
