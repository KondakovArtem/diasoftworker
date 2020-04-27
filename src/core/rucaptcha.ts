import RNFS from 'react-native-fs';
import * as path from 'react-native-path';
import RNFetchBlob from 'rn-fetch-blob';
import {uniqueId} from 'lodash-es';
import qs from 'querystring';

const API_RES = 'http://rucaptcha.com/res.php';
const API_UPLOAD = 'http://rucaptcha.com/in.php';

interface IParams {
  tmpDir?: string;
  checkDelay?: number;
  apiKey: string;
}

const delay = async (count: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, count);
  });
};

export class RuCaptcha {
  constructor(private params: IParams) {
    if (params.tmpDir) {
      params.tmpDir = path.resolve(RNFS.PicturesDirectoryPath, params.tmpDir);
    } else {
      params.tmpDir = path.resolve(RNFS.PicturesDirectoryPath, './tmp');
    }
    params.checkDelay = params.checkDelay || 1000;
  }

  async downloadFile(url: string) {
    const {params} = this;
    // let PictureDir = fs.dirs.PictureDir; // this is the pictures directory. You can check the available directories in the wiki.
    const filePath = `${params.tmpDir}/${uniqueId('captcha_')}.jpeg`;
    const res = await RNFetchBlob.config({
      // add this option that makes response data to be stored as a file,
      // this is much more performant.
      fileCache: true,
      path: filePath,
    }).fetch('GET', url);
    return res.path();
  }

  async getAnswer(captchaId: string): Promise<string> {
    const {params} = this;
    const response = await RNFetchBlob.fetch(
      'GET',
      `${API_RES}?${qs.stringify({
        key: params.apiKey,
        action: 'get',
        id: captchaId,
      })}`,
      {},
    );
    if (response.data === 'CAPCHA_NOT_READY') {
      await delay(params.checkDelay as number);
      return this.getAnswer(captchaId);
    } else {
      return response.data.split('|')[1];
    }
  }

  async uploadFile(fileName: string) {
    const {params} = this;
    const res = await RNFetchBlob.fetch(
      'POST',
      API_UPLOAD,
      {
        'Content-Type': 'multipart/form-data',
      },
      qs.stringify({
        key: params.apiKey,
        body: await RNFetchBlob.fs.readFile(fileName, 'base64', 4096),
        method: 'base64',
        // phrase: 0,
        // regsense: 0,
        // numeric: 0,
        // calc: 0,
        // min_leng: 0,
        // max_len: 0,
        // language: 0,
        // soft_id: 679,
      }),
    );
    if (res.respInfo.status === 200 && res.data.indexOf('ERROR') === -1) {
      return this.getAnswer(res.data.split('|')[1]);
    } else {
      return res.data;
    }
  }

  public async solve(captchaPath: string) {
    const {params} = this;
    await RNFS.mkdir(params.tmpDir as string);
    //check whether path is url
    var is_url = /^(http|https|ftp){1}\:\/\//.test(captchaPath);
    if (is_url) {
      const filePath = await this.downloadFile(captchaPath);
      return await this.uploadFile(filePath);
    } else {
      return await this.uploadFile(captchaPath);
    }
  }
}
