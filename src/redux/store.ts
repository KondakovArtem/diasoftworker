import {createStore, applyMiddleware, combineReducers, Dispatch, Store} from 'redux';
import thunk from 'redux-thunk';
import {createLogger} from 'redux-logger';
import AsyncStorage from '@react-native-community/async-storage';
import {persistStore, persistReducer, createTransform, Persistor} from 'redux-persist';

import {reducer as commonReducer, IStore as ICommonStore} from '@app/redux/common/common.ducks';
import {reducer as loginReducer, IStore as ILoginStore} from '@app/redux/common/login.ducks';
import {reducer as schedulerReducer, IStore as ISchedulerStore} from '@app/redux/scheduler/scheduler.ducks';
import { each } from 'lodash-es';

export type IConfiguredStore = {
  common: ICommonStore;
  login: ILoginStore;
  scheduler: ISchedulerStore;
};

const reducer = combineReducers({
  common: commonReducer,
  login: loginReducer,
  scheduler: schedulerReducer,
});

const replacer = (key: string, value: any) => (value instanceof Date ? value.toISOString() : value);
const reviver = (key: string, value: any) =>
  typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) ? new Date(value) : value;
const encode = (toDeshydrate: any) => JSON.stringify(toDeshydrate, replacer);
export const decode = (toRehydrate: any) => {
  return typeof toRehydrate === 'string' ? JSON.parse(toRehydrate, reviver) : toRehydrate;
};

export const decodeAll = (serialized: string): IConfiguredStore => {
  const data = decode(serialized);
  each(data, (value, key) => {
    data[key] = JSON.parse(decode(value));
  });
  return data;
};

const persistConfig = {
  key: 'root',
  storage: {
    setItem: async (key: string, value: any) => {
      return await AsyncStorage.setItem(key, value);
    },
    getItem: async (key: string) => {
      const res = await AsyncStorage.getItem(key);
      return res;
    },
    removeItem: async (key: string) => {
      return await AsyncStorage.removeItem(key);
    },
  },
  transforms: [createTransform(encode, decode)],
};

export type GetStore = () => IConfiguredStore;
export type ThunkAction = (dispatch: Dispatch, getStore?: GetStore) => any;

export interface IDispatchActions {
  [key: string]: (...args: any[]) => ThunkAction;
}

let store: Store;
let persistor: Persistor;

export default () => {
  if (!store || !persistor) {
    const persistedReducer = persistReducer(persistConfig, reducer);
    store = createStore(persistedReducer, applyMiddleware(thunk, createLogger()));
    persistor = persistStore(store);
  }
  return {store, persistor};
};
