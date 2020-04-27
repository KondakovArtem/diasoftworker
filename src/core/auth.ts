import {RuCaptcha} from '@app/core/rucaptcha';
import axios from 'axios';
import cheerio from 'react-native-cheerio';
import qs from 'querystring';

import {getGrantFileSystem} from './permission';
import {ICheckAuthResponse, HOST_URL, DEFAULT_PAGE_URL, LOGOUT_URL, LOGOUT_RESULT_URL, LOGIN_PAGE_URL, AUTH_PAGE_URL, IUserData} from './api';

interface IAuthResponse extends IUserData {
  isAuth: boolean;
  error?: string;
}

export const checkAuth = async (): Promise<ICheckAuthResponse> => {
  const checkPage = await axios.get(`${HOST_URL}${DEFAULT_PAGE_URL}`);

  if (checkPage.request.responseURL === `${HOST_URL}${DEFAULT_PAGE_URL}`) {
    const $ = cheerio.load(checkPage.data);
    const isOnWork = $('#btnRemoteRegStart').length ? false : true;
    return {
      isAuth: true,
      userFullName: $('#lblUsername').text(),
      isOnWork,
    };
  }
  return {
    isAuth: false,
  };
};

export const logout = async () => {
  const logoutPage = await axios.get(`${HOST_URL}${LOGOUT_URL}`);
  return logoutPage.request.responseURL === `${HOST_URL}${LOGOUT_RESULT_URL}`;
};

export const auth = async (username: string, password: string, captchaKey: string): Promise<IAuthResponse> => {
  try {
    if (!(await getGrantFileSystem())) {
      throw new Error('No Permission');
    }

    const loginPage = await axios.get(`${HOST_URL}${LOGIN_PAGE_URL}`);
    let $ = cheerio.load(loginPage.data);

    const captchaUrl = $('#ASPxCaptcha1_IMG').attr('src');
    const __VIEWSTATE = $('#__VIEWSTATE').attr('value');
    const __VIEWSTATEGENERATOR = $('#__VIEWSTATEGENERATOR').attr('value');

    const solver = new RuCaptcha({
      apiKey: captchaKey, // captchaKey, //required
      tmpDir: './tmp', //optional, default is './tmp'
      checkDelay: 1000, //optional, default is 1000 - interval between captcha checks
    });

    const captchaValue = await solver.solve(`${HOST_URL}${captchaUrl}`);
    if (captchaValue.indexOf('ERROR') > -1) {
      return {
        isAuth: false,
        error: captchaValue,
      };
    }

    const formData = {
      __EVENTTARGET: '',
      __EVENTARGUMENT: '',
      __VIEWSTATE,
      __VIEWSTATEGENERATOR,
      tbUserName: username,
      tbPassword: password,
      ASPxCaptcha1$TB$State: '{&quot;validationState&quot;:&quot;&quot;}',
      ASPxCaptcha1$TB: captchaValue,
      btnLogin: 'Р’РѕР№С‚Рё',
      pcChangeLoginState: '{&quot;windowsState&quot;:&quot;0:0:-1:0:0:0:-10000:-10000:1:0:0:0&quot;}',
      pcChangeLogin$Panel1$tbOldPassword$State: '{&quot;validationState&quot;:&quot;&quot;}',
      pcChangeLogin$Panel1$tbOldPassword: '',
      pcChangeLogin$Panel1$tbNewPassword1$State: '{&quot;validationState&quot;:&quot;&quot;}',
      pcChangeLogin$Panel1$tbNewPassword1: '',
      pcChangeLogin$Panel1$tbNewPassword2$State: '{&quot;validationState&quot;:&quot;&quot;}',
      pcChangeLogin$Panel1$tbNewPassword2: '',
      ResetPasswordASPxPopupControlState: '{&quot;windowsState&quot;:&quot;0:0:-1:0:0:0:-10000:-10000:1:0:0:0&quot;}',
      ResetPasswordASPxPopupControl$rblResetPasswordMode: 'ByLogin',
      ResetPasswordASPxPopupControl$tbResetPassword$State: '{&quot;validationState&quot;:&quot;&quot;}',
      ResetPasswordASPxPopupControl$tbResetPassword: '',
      MessageASPxPopupControlState: '{&quot;windowsState&quot;:&quot;0:0:-1:0:0:0:-10000:-10000:1:0:0:0&quot;}',
      DXScript: '1_10,1_11,1_22,1_61,1_12,1_13,1_14,1_276,1_256,1_257,1_16,1_39,1_255,1_262,1_40',
      DXCss: 'CSS/Style_white.css,/RMSdotNET/favicon.ico,1_280,1_65,1_67,1_279,1_283,1_282,1_71,1_70',
    };

    const authRes = await axios.post(`${HOST_URL}${AUTH_PAGE_URL}`, qs.stringify(formData));
    $ = cheerio.load(authRes.data);

    if (authRes.request.responseURL === `${HOST_URL}${LOGIN_PAGE_URL}`) {
      const errorEl = $('#form_login > table > tbody > tr:nth-child(7) > td');
      let error = 'Ошибка авторизации';
      if (errorEl && errorEl.text().trim() !== '') {
        // Alert.alert('Авторизация не пройдена', errorEl.text().trim().replace(/\t/gi, ''));
        error = errorEl.text().trim().replace(/\t/gi, '');
      }
      return {
        isAuth: false,
        error,
      };
    }
    return {
      isAuth: true,
      userFullName: $('#lblUsername').text(),
    };
  } catch (e) {
    console.error(e);
    return {
      isAuth: false,
      error: 'Ошибка авторизации',
    };
  }
};
