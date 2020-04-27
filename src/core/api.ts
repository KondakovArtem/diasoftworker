import axios, {AxiosResponse} from 'axios';
import cheerio from 'react-native-cheerio';
import {each} from 'lodash-es';
import moment from 'moment';

export const HOST_URL = 'https://websigma.diasoft.ru';
export const LOGIN_PAGE_URL = '/RMSdotNET/login.aspx?Destination=%2fRMSdotNET%2fDefault.aspx';
export const AUTH_PAGE_URL = '/RMSdotNET/login.aspx?Destination=%2fRMSdotNET%2fDefault.aspx';
export const DEFAULT_PAGE_URL = '/RMSdotNET/Default.aspx';
export const LOGOUT_URL = '/RMSdotNET/logout.aspx';
export const LOGOUT_RESULT_URL = '/RMSdotNET/login.aspx?Quit=1';
const CHECK_WORK_PAGE = '/RMSdotNET/Default.aspx?WebPageID=477';

export interface IUserData {
  userFullName?: string;
  isOnWork?: boolean;
}

export interface ICheckAuthResponse extends IUserData {
  isAuth: boolean;
}

interface IStartWorkResponse {
  isAuth: boolean;
  isOnWork?: boolean;
  result: string;
}

export const setIsOnWork = async (value: boolean): Promise<IStartWorkResponse> => {
  const dataPage = await axios.get(`${HOST_URL}${CHECK_WORK_PAGE}`);

  const checkData = checkDataResponse(await axios.get(`${HOST_URL}${CHECK_WORK_PAGE}`));
  if (!checkData.isAuth) {
    return {
      ...checkData,
      result: 'ERROR_AUTH',
    };
  }

  if (value && checkData.isOnWork) {
    return {
      ...checkData,
      result: 'ERROR_ALREADY_ONWORK',
    };
  }

  if (!value && !checkData.isOnWork) {
    return {
      ...checkData,
      result: 'ERROR_ALREADY_REST',
    };
  }

  const $ = cheerio.load(dataPage.data);
  const inputList = $('form input');
  const formData = new FormData();
  const defProps: any = {
    __EVENTTARGET: '',
    __EVENTARGUMENT: '',
    dxMask$State: '{&quot;rawValue&quot;:&quot;0&quot;,&quot;validationState&quot;:&quot;&quot;}',
    dxMask: '0',
    dxComboQuickSearch$DDD$L: 'Project',
    dxComboQuickSearch$DDDState: '{&quot;windowsState&quot;:&quot;0:0:-1:0:0:0:-10000:-10000:1:0:0:0&quot;}',
    dxComboQuickSearch$DDD$L$State: '{&quot;CustomCallback&quot;:&quot;&quot;}',
    ctl06$GlobalNav: '{&quot;selectedItemIndexPath&quot;:&quot;4i13&quot;,&quot;checkedState&quot;:&quot;&quot;}',
    ctl05$hfDateTime: moment().toISOString(),
    ctl05$hfDateTimeOffset: moment().utcOffset(),
    puRemoteRegistrationState: '{&quot;windowsState&quot;:&quot;0:0:-1:0:0:0:-10000:-10000:1:0:0:0&quot;}',
    hfDateTime: '',
    hfDateTimeOffset: '',
    DXScript: '1_10,1_11,1_22,1_61,1_12,1_13,1_256,1_257,1_258,1_20,1_21,1_263,1_14,1_16,1_259,1_266,1_39,1_255,1_23,1_31',
    DXCss:
      '/RMSdotNET/CSS/style_global.css?20181109,/RMSdotNET/CSS/style_Black.css?20181219,/RMSdotNET/favicon.ico,1_283,1_280,1_65,1_67,1_282,1_279,1_71,1_70',
  };
  const excluded = ['btnQuickSearch'];
  const appended: string[] = [];
  each(inputList, (input) => {
    const {
      attribs: {name, attrValue},
    } = input;
    if (name && !excluded.includes(name)) {
      formData.append(name, defProps[name] || attrValue || '');
      appended.push(name);
    }
  });
  each(defProps, (attrValue, key) => {
    if (!appended.includes(key)) {
      formData.append(key, attrValue);
    }
  });
  const res = await axios.post(`${HOST_URL}${CHECK_WORK_PAGE}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const resData = checkDataResponse(res);
  return {
    ...resData,
    result: resData.isAuth ? 'OK' : 'ERROR',
  };
};

const checkDataResponse = (response: AxiosResponse<any>) => {
  if (response.request.responseURL === `${HOST_URL}${CHECK_WORK_PAGE}`) {
    const $ = cheerio.load(response.data);
    const userFullName = $('#lblUsername').text();
    const startButton = $(".dxbButton[id*='btnStartRemoteWork']");
    const endButton = $(".dxbButton[id*='btnEndRemoteWork']");
    let isOnWork = false;
    if (startButton.hasClass('dxbDisabled') && !endButton.hasClass('dxbDisabled')) {
      isOnWork = true;
    }
    return {
      isAuth: true,
      isOnWork,
      userFullName,
    };
  }
  return {
    isAuth: false,
  };
};

export const fetchData = async (): Promise<ICheckAuthResponse> => {
  const dataPage = await axios.get(`${HOST_URL}${CHECK_WORK_PAGE}`);
  return checkDataResponse(dataPage);
};
