import React, {FC, useEffect} from 'react';
import {View, Text, StyleSheet, RefreshControl} from 'react-native';
import {Subheading} from 'react-native-paper';
import {connect} from 'react-redux';

import {IConfiguredStore} from '@app/redux/store';
import {Actions as loginActions} from '@app/redux/common/login.ducks';
import {Actions as commonActions} from '@app/redux/common/common.ducks';
import {ToggleButton} from 'react-native-paper';
import {ScrollView} from 'react-native-gesture-handler';

interface IProps {
  isOnWork: boolean;
  userFullName: string;
  isRefreshing: boolean;
}

interface IHandlers {
  signOut(): void;
  sendIsOnWork(status: string): void;
  onRefresh(): void;
}

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  buttonRow: {
    width: '100%',
    flex: 1,
    padding: 20,
  },
  button: {
    flex: 1,
    flexGrow: 1,
  },
  scrollContent: {flexGrow: 1},
  bold: {fontWeight: 'bold'},
  normal: {fontWeight: 'normal'},
});

export const HomeScreenComponent: FC<IProps & IHandlers> = ({isOnWork, userFullName, sendIsOnWork, isRefreshing, onRefresh}) => {
  useEffect(() => {
    onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
      <View style={styles.wrapper}>
        <Subheading>Привет, {userFullName}, ты сейчас</Subheading>
        <View style={styles.buttonContainer}>
          <ToggleButton.Row value={isOnWork ? 'work' : 'rest'} style={styles.buttonRow} onValueChange={sendIsOnWork}>
            <ToggleButton
              disabled={isRefreshing}
              style={styles.button}
              icon={() => <Text style={isOnWork ? styles.normal : styles.bold}>Отдыхаешь</Text>}
              value="rest"
            />
            <ToggleButton
              disabled={isRefreshing}
              style={styles.button}
              icon={() => <Text style={isOnWork ? styles.bold : styles.normal}>Трудишься</Text>}
              value="work"
            />
          </ToggleButton.Row>
        </View>
        {/* <Text onPress={() => signOut()}>Home Screen</Text> */}
      </View>
    </ScrollView>
  );
};

export const HomeScreen = connect<IProps, IHandlers, {}, IConfiguredStore>(
  ({common}) => {
    const {isOnWork, userFullName, isRefreshing} = common;
    return {
      isOnWork,
      userFullName,
      isRefreshing,
    };
  },
  {
    signOut: loginActions.signOut,
    sendIsOnWork: commonActions.sendIsOnWork,
    onRefresh: commonActions.refreshData,
  },
)(HomeScreenComponent);
