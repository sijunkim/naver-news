import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { ConfigType } from '@nestjs/config';
import naverConfig from 'src/config/naverConfig';
import { HttpResponse } from 'src/entity/httpResponse';
import { XMLParser } from 'fast-xml-parser';
import { News } from 'src/entity/news';
import SlackWebhook from 'src/common/util/slackWebhook';
import NewsRefiner from 'src/common/util/newsRefiner';

@Injectable()
export class NaverService {
  constructor(
    @Inject(naverConfig.KEY)
    private naverconfig: ConfigType<typeof naverConfig>,
    private readonly slackWebhook: SlackWebhook,
    private readonly newsRefiner: NewsRefiner,
  ) {}

  getNaverApiConfiguration(keyword: string): AxiosRequestConfig {
    const querystring = `${encodeURI(keyword)}&display=3&start=1&sort=date`;
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

  refineNews(news: News): any {
    return {
      text: news.title,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*<${news.link}|${news.title}>*`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'plain_text',
              text: `${news.pubDate} | ${news.company}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: news.description,
            emoji: true,
          },
        },
        {
          type: 'divider',
        },
      ],
    };
  }

  async sendNaverNewsToSlack(news: Array<News>): Promise<HttpResponse> {
    try {
      for (const item of news) {
        // 데이터 정제하는 부분
        item.title = this.newsRefiner.htmlParsingToText(item.title);
        item.pubDate = this.newsRefiner.pubDateToKoreaTime(item.pubDate);
        item.description = this.newsRefiner.htmlParsingToText(item.description);
        item.company = this.newsRefiner.substractComapny(
          item.link,
          item.originallink,
        );

        // 메세지 폼 만드는 부분
        const payload = this.refineNews(item);

        await this.slackWebhook.send(payload);
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
