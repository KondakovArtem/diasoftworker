import {createReducer, createAction, Action} from 'typesafe-actions';
import {ThunkAction} from '../store';
import {Alert} from 'react-native';

import {auth, logout} from '@app/core/auth';
import {Actions as commonActions, CLEAR_DATA} from '@app/redux/common/common.ducks';
import {DEFAULT_CAPTCHA_KEY} from '@app/core/contants';
import {stopScheduler} from '@app/core/scheduler';

export const SET_LOGIN = '@login/SET_LOGIN';
export const SET_PASSWORD = '@login/SET_PASSWORD';
export const SET_CAPTCHA_KEY = '@login/SET_CAPTCHA_KEY';
export const SET_IS_LOADING = '@login/SET_IS_LOADING';
export const SET_PRIVATE_CAPTCHA_KEY = '@login/SET_PRIVATE_CAPTCHA_KEY';

/////////////////////////////////////////////
// STORE
/////////////////////////////////////////////
export interface IStore {
  username: string;
  password: string;
  captchaKey: string;
  privateCaptchaKey: boolean;
  isLoading: boolean;
}

export const initialState: IStore = {
  username: '',
  password: '',
  captchaKey: '',
  privateCaptchaKey: false,
  isLoading: false,
};

/////////////////////////////////////////////
// ACTIONS
/////////////////////////////////////////////
const setUsername = createAction(SET_LOGIN, (v: string) => v)();
const setPassword = createAction(SET_PASSWORD, (v: string) => v)();
const setCaptchaKey = createAction(SET_CAPTCHA_KEY, (v: string) => v)();
const setIsLoading = createAction(SET_IS_LOADING, (v: boolean) => v)();
const clearData = createAction(CLEAR_DATA, () => {})();
const setPrivateCaptchaKey = createAction(SET_PRIVATE_CAPTCHA_KEY, (v: boolean) => v)();

export const Actions = {
  setUsername: (username: string): ThunkAction => async (dispatch) => {
    dispatch(setUsername(username));
  },
  setPassword: (password: string): ThunkAction => async (dispatch) => {
    dispatch(setPassword(password));
  },
  setCaptchaKey: (captchaKey: string): ThunkAction => async (dispatch) => {
    dispatch(setCaptchaKey(captchaKey));
  },
  setIsLoading: (isLoading: boolean): ThunkAction => async (dispatch) => {
    dispatch(setIsLoading(isLoading));
  },
  setPrivateCaptchaKey: (value: boolean): ThunkAction => async (dispatch) => {
    dispatch(setPrivateCaptchaKey(value));
  },
  signIn: (): ThunkAction => async (dispatch, getStore) => {
    dispatch(setIsLoading(true));
    const {login} = getStore!();
    const {password, username, privateCaptchaKey} = login;
    let {captchaKey} = login;
    if (!privateCaptchaKey) {
      captchaKey = DEFAULT_CAPTCHA_KEY;
    }
    const authRes = await auth(username, password, captchaKey);
    dispatch(setIsLoading(false));

    if (!authRes.isAuth) {
      Alert.alert('Ошибка авторизации', authRes.error);
      return;
    }
    if (authRes.isAuth) {
      commonActions.setAuthData({
        isAuth: true,
        password,
        username,
        captchaKey,
        userFullName: authRes.userFullName!,
      })(dispatch, getStore);
      return;
    }
  },
  signOut: (): ThunkAction => async (dispatch) => {
    const logoutRes = await logout();
    if (logoutRes) {
      dispatch({type: CLEAR_DATA});
      stopScheduler();
    }
  },
};

/////////////////////////////////////////////
// REDUCERS
/////////////////////////////////////////////
export const reducer = createReducer<IStore, Action>(initialState)
  .handleAction(setUsername, (state, {payload}) => ({
    ...state,
    username: payload,
  }))
  .handleAction(setPassword, (state, {payload}) => ({
    ...state,
    password: payload,
  }))
  .handleAction(setCaptchaKey, (state, {payload}) => ({
    ...state,
    captchaKey: payload,
  }))
  .handleAction(setIsLoading, (state, {payload}) => ({
    ...state,
    isLoading: payload,
  }))
  .handleAction(clearData, () => ({
    ...initialState,
  }))
  .handleAction(setPrivateCaptchaKey, (state, {payload}) => ({
    ...state,
    privateCaptchaKey: payload,
  }));
