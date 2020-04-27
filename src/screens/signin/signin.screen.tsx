import React, {FC} from 'react';
import {TouchableOpacity, StyleSheet, Text, View, Alert} from 'react-native';
import Background from '@app/components/background/background.component';
import TextInput from '@app/components/text-input/text-input.component';
import Button from '@app/components/button/button.component';
import {connect} from 'react-redux';
import {IConfiguredStore} from '@app/redux/store';
import {Actions as authActions} from '@app/redux/common/login.ducks';
import {theme} from '@app/core/theme';
import {Checkbox} from 'react-native-paper';

interface IProps {
  username: string;
  password: string;
  captchaKey: string;
  privateCaptchaKey: boolean;
  isLoading: boolean;
}
interface IHandlers {
  setUsername(username: string): void;
  setPassword(password: string): void;
  setCaptchaKey(captchaKey: string): void;
  setPrivateCaptchaKey(value: boolean): void;
  signIn: () => void;
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  label: {
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  checkboxContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

const LoginScreenComponent: FC<IProps & IHandlers> = ({
  password,
  isLoading,
  privateCaptchaKey,
  setPassword,
  setUsername,
  signIn,
  username,
  captchaKey,
  setCaptchaKey,
  setPrivateCaptchaKey,
}) => {
  return (
    <Background>
      <View style={styles.wrapper}>
        <TextInput disabled={isLoading} label="Логин" returnKeyType="next" value={username} onChangeText={(text: string) => setUsername(text)} />
        <TextInput
          disabled={isLoading}
          label="Пароль"
          returnKeyType="done"
          value={password}
          onChangeText={(text: string) => setPassword(text)}
          secureTextEntry
        />

        <View style={styles.checkboxContainer}>
          <Checkbox status={privateCaptchaKey ? 'checked' : 'unchecked'} onPress={() => setPrivateCaptchaKey(!privateCaptchaKey)} />
          <Text>RuCaptcha ключ</Text>
        </View>
        {privateCaptchaKey && (
          <>
            <TextInput
              disabled={isLoading}
              label="Rucaptcha key"
              returnKeyType="done"
              value={captchaKey}
              onChangeText={(text: string) => setCaptchaKey(text)}
              secureTextEntry
            />
            <Text>
              Этот ключ предназначен для вызова апи автоматического распознавания капчи при помощи сервиса https://rucaptcha.com. В приложение встроен
              свой ключ, но это АПИ платное, так что лучше пользуйтесь своим
            </Text>
          </>
        )}

        <View style={styles.forgotPassword}>
          <TouchableOpacity
            disabled={isLoading}
            onPress={() => {
              Alert.alert('Не проблема', 'Спросите у админа.');
            }}>
            <Text style={styles.label}>Забыли свой пароль?</Text>
          </TouchableOpacity>
        </View>

        <Button loading={isLoading} disabled={isLoading} mode="contained" onPress={signIn}>
          Войти
        </Button>

        <View style={styles.row}>
          <TouchableOpacity
            disabled={isLoading}
            onPress={() => Alert.alert('Не беда', 'Пройдите собеседование, устройтесь на работу в ООО Диасофт, вам выдадут.')}>
            <Text style={styles.label}>Нет аккаунта?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Background>
  );
};

export const LoginScreen = connect<IProps, IHandlers, {}, IConfiguredStore>(
  ({login}) => {
    return login;
  },
  {
    setUsername: authActions.setUsername,
    setPassword: authActions.setPassword,
    setCaptchaKey: authActions.setCaptchaKey,
    setPrivateCaptchaKey: authActions.setPrivateCaptchaKey,
    signIn: authActions.signIn,
  },
)(LoginScreenComponent);
