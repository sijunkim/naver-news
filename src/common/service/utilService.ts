import { Injectable } from '@nestjs/common';
import { DEVELOP, DEBUG, PRODUCTION } from '../type/naver';

@Injectable()
export default class UtilService {
  public static isDevelop(): boolean {
    return process.env.NODE_ENV == DEVELOP;
  }

  public static isDebug(): boolean {
    return process.env.NODE_ENV == DEBUG;
  }

  public static isProduction(): boolean {
    return process.env.NODE_ENV == PRODUCTION;
  }
}
