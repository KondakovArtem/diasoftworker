import axios from 'axios';
// import FileCookieStore from 'file-cookie-store';
import * as axiosCookieJarSupport from 'axios-cookiejar-support';
import tough from 'tough-cookie';
// import http from 'http';
import https from 'https';

const path = require('path');

// axios.defaults.httpAgent = new http.Agent({keepAlive: true});
axios.defaults.httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});
axios.defaults.withCredentials = true;
axiosCookieJarSupport(axios.defaults);
const cookieJar = new tough.CookieJar();
const log4js = require('log4js');

// At instance level
const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

log4js.configure(path.resolve(__dirname, '../.config/logger.json'));

const defaultOpts = {
  jar: cookieJar, // tough.CookieJar or boolean
  withCredentials: true,
  maxRedirects: 3,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Content-Type': 'application/x-www-form-urlencoded',
    Connection: 'keep-alive',
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    Origin: 'https://websigma.diasoft.ru',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  },
};

module.exports = {
  axios: {
    post: async (url, params, opts = {}) => {
      return instance.post(url, params, {
        ...defaultOpts,
        ...opts,
      });
    },
    get: async (url, opts = {}) => {
      return instance.get(url, {
        ...defaultOpts,
        ...opts,
      });
    },
  },
  axiosInstance: instance,
  log4js,
};
