import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { ConfigType } from '@nestjs/config';
import naverConfig from 'src/config/naverConfig';
import { HttpResponse } from 'src/entity/httpResponse';
import { XMLParser } from 'fast-xml-parser';
import { News } from 'src/entity/news';
import SlackWebhook from 'src/common/util/slackWebhook';
import NewsRefiner from 'src/common/util/newsRefiner';
import * as fs from 'fs';

@Injectable()
export class NaverService {
  constructor(
    @Inject(naverConfig.KEY)
    private naverconfig: ConfigType<typeof naverConfig>,
    private readonly slackWebhook: SlackWebhook,
    private readonly newsRefiner: NewsRefiner,
  ) {}

  getNaverApiConfiguration(keyword: string): AxiosRequestConfig {
    const querystring = `${encodeURI(keyword)}&display=5&start=1&sort=date`;
    const uri = `https://openapi.naver.com/v1/search/news.xml?query=${querystring}`;
    return {
      url: uri,
      headers: {
        'X-Naver-Client-Id': this.naverconfig.client_id,
        'X-Naver-Client-Secret': this.naverconfig.client_secret,
      },
    };
  }

  async getBreakingNews(news: Array<News>) {
    const breakingNews: Array<News> = new Array<News>();
    for (const item of news) {
      if (item.title.includes('속보')) {
        breakingNews.push(item);
      }
    }

    return breakingNews;
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

  async refineNews(news: News): Promise<any> {
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
            text: `${news.description ?? '내용없음'}`,
            emoji: true,
          },
        },
        {
          type: 'divider',
        },
      ],
    };
  }

  async setLastReceivedTime(firstItemPubDate: string) {
    await fs.writeFileSync('src/data/time/lastReceivedTime.txt', firstItemPubDate);
  }

  async getLastReceivedTime() {
    return await fs.readFileSync('src/data/time/lastReceivedTime.txt', { encoding: 'utf8' });
  }

  async sendNaverNewsToSlack(news: Array<News>): Promise<HttpResponse> {
    const firstItemPubDate: string = news[0].pubDate;
    const lastReceivedTime = await this.getLastReceivedTime();

    for (const item of news.reverse()) {
      if (new Date(lastReceivedTime) < new Date(item.pubDate)) {
        try {
          // 데이터 정제하는 부분
          item.title = this.newsRefiner.htmlParsingToText(item.title);
          item.pubDate = this.newsRefiner.pubDateToKoreaTime(item.pubDate);
          item.description = this.newsRefiner.htmlParsingToText(item.description);
          item.company = this.newsRefiner.substractComapny(item.link, item.originallink);

          // 메세지 폼 만드는 부분
          const payload = await this.refineNews(item);

          await this.slackWebhook.send(payload);
        } catch (error) {
          console.error(error);
        }
      }
    }

    await this.setLastReceivedTime(firstItemPubDate);

    return {
      status: 200,
      message: 'success',
      data: '',
    };
  }
}
