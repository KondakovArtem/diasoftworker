import {PermissionsAndroid} from 'react-native';

export const getGrantFileSystem = async () => {
  try {
    const grantedRead = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        buttonPositive: 'OK',
        title: 'External Read',
        message: 'External Read',
      },
    );
    const grantedWrite = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        buttonPositive: 'OK',
        title: 'External Write',
        message: 'External Write',
      },
    );
    if (
      grantedRead === PermissionsAndroid.RESULTS.GRANTED &&
      grantedWrite === PermissionsAndroid.RESULTS.GRANTED
    ) {
      return true;
    }
    const checkResult =
      (await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      )) &&
      (await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ));
    return checkResult;
  } catch (e) {}
  return false;
};
