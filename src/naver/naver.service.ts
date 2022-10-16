import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigType } from '@nestjs/config';
import naverConfig from 'src/config/naverConfig';

@Injectable()
export class NaverService {
  constructor(
    @Inject(naverConfig.KEY) private config: ConfigType<typeof naverConfig>,
  ) {}

  async getNaverNews(keyword: string) {
    const client_id = this.config.client_id;
    const client_secret = this.config.client_secret;
    const result = axios.get(
      `https://openapi.naver.com/v1/search/news.xml?query=${keyword}&display=1&start=1&sort=date`,
      {
        headers: {
          'X-Naver-Client-Id': client_id,
          'X-Naver-Client-Secret': client_secret,
        },
      },
    );

    return result;
  }
}
