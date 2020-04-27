import React, {FC, useEffect} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {connect} from 'react-redux';

import {LoginScreen} from '@app/screens/signin/signin.screen';
import {HomeScreen} from '@app/screens/home/home.screen';
import {DetailsScreen} from '@app/screens/details/details.screen';
import {IConfiguredStore} from '@app/redux/store';
import {Actions as commonActions} from '@app/redux/common/common.ducks';
import {TransitionSpec} from '@react-navigation/stack/lib/typescript/src/types';

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

interface IProps {
  isAuth: boolean;
}
interface IHandlers {
  onInit(): void;
}

const config: TransitionSpec = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

const AppNavigation = () => (
  <Tab.Navigator shifting={true} activeColor="#f0edf6" inactiveColor="#771725" barStyle={{backgroundColor: '#b0283c'}}>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({color}) => <MaterialCommunityIcons name="home" color={color} size={26} />,
      }}
    />
    <Tab.Screen
      name="Details"
      component={DetailsScreen}
      options={{
        title: 'Настройка',
        tabBarIcon: ({color}) => <MaterialCommunityIcons name="account" color={color} size={26} />,
      }}
    />
  </Tab.Navigator>
);

export const NavigatorComponent: FC<IProps & IHandlers> = ({isAuth, onInit}) => {
  useEffect(() => {
    onInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack.Navigator>
      {!isAuth ? (
        <Stack.Screen
          name="SignIn"
          component={LoginScreen}
          options={{
            headerShown: false,
            transitionSpec: {
              close: config,
              open: config,
            },
          }}
        />
      ) : (
        <Stack.Screen
          name="App"
          component={AppNavigation}
          options={{
            headerShown: false,
            transitionSpec: {
              close: config,
              open: config,
            },
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export const Navigator = connect<IProps, IHandlers, {}, IConfiguredStore>(
  ({common}) => {
    const {isAuth} = common;
    return {
      isAuth,
    };
  },
  {
    onInit: commonActions.onInit,
  },
)(NavigatorComponent);
