import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { ConfigType } from '@nestjs/config';
import naverConfig from 'src/config/naverConfig';
import { HttpResponse } from 'src/entity/httpResponse';
import { XMLParser } from 'fast-xml-parser';
import { News } from 'src/entity/news';
import SlackWebhook from 'src/common/util/slackWebhook';

@Injectable()
export class NaverService {
  constructor(
    @Inject(naverConfig.KEY)
    private naverconfig: ConfigType<typeof naverConfig>,
    private readonly slackWebhook: SlackWebhook,
  ) {}

  getNaverApiConfiguration(keyword: string): AxiosRequestConfig {
    const querystring = `${encodeURI(keyword)}&display=10&start=1&sort=date`;
    const uri = `https://openapi.naver.com/v1/search/news.xml?query=${querystring}`;
    return {
      url: uri,
      headers: {
        'X-Naver-Client-Id': this.naverconfig.client_id,
        'X-Naver-Client-Secret': this.naverconfig.client_secret,
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
      const json = new XMLParser().parse(response.data);
      result.data = json.rss.channel.item;
      result.message = 'success';
    } catch (error) {
      console.error(error);
    }
    return result;
  }

  async postNaverNewsToSlack(news: Array<News>): Promise<HttpResponse> {
    try {
      for (const item of news) {
        await this.slackWebhook.send(item);
      }
      return {
        status: 200,
        message: 'success',
        data: '',
      };
    } catch (error) {
      console.error(error);
    }
  }
}
