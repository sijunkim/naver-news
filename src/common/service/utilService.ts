import { Injectable } from '@nestjs/common';

@Injectable()
export default class UtilService {
  public static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  public static isDebug(): boolean {
    return process.env.NODE_ENV === 'debug';
  }

  public static isDevelop(): boolean {
    return process.env.NODE_ENV === 'develop';
  }
}
