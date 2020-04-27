import React, {useEffect} from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider as ReduxProvider} from 'react-redux';
import {Provider as PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import 'react-native-gesture-handler';

import configuredStore from '@app/redux/store';
import {theme} from '@app/core/theme';
import {Navigator} from '@app/components/navigator/navigator.component';
import {clearNotification} from '@app/core/scheduler';
import SplashScreen from 'react-native-splash-screen';

declare const global: {HermesInternal: null | {}};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
const {persistor, store} = configuredStore();

const App = () => {
  useEffect(() => {
    clearNotification();
    SplashScreen.hide();
  }, []);

  return (
    <NavigationContainer>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <PaperProvider theme={theme}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea}>
              <Navigator />
            </SafeAreaView>
          </PaperProvider>
        </PersistGate>
      </ReduxProvider>
    </NavigationContainer>
  );
};

export default App;
