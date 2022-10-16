import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { ConfigType } from '@nestjs/config';
import naverConfig from 'src/config/naverConfig';
import { HttpResponse } from 'src/entity/httpResponse';
import convert from 'xml-js';
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';

@Injectable()
export class NaverService {
  constructor(
    @Inject(naverConfig.KEY) private config: ConfigType<typeof naverConfig>,
  ) {}

  getNaverApiConfiguration(keyword: string): AxiosRequestConfig {
    const querystring = `${encodeURI(keyword)}&display=100&start=1&sort=date`;
    const uri = `https://openapi.naver.com/v1/search/news.xml?query=${querystring}`;
    return {
      url: uri,
      headers: {
        'X-Naver-Client-Id': this.config.client_id,
        'X-Naver-Client-Secret': this.config.client_secret,
      },
    };
  }

  async getNaverNews(keyword: string): Promise<HttpResponse> {
    const result: HttpResponse = new HttpResponse();
    const configuration = this.getNaverApiConfiguration(keyword);

    try {
      const response = await axios.get(configuration.url, {
        headers: configuration.headers,
      });
      result.status = response.status;
      console.log(response.data);
      result.data = new XMLParser().parse(response.data);
      result.message = 'success';
    } catch (error) {
      console.error(error);
    }

    return result;
  }
}
