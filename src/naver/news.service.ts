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
import { NEWSTYPE } from '../common/type/naver';

@Injectable()
export class NewsService {
  constructor(
    @Inject(naverConfig.KEY)
    private naverconfig: ConfigType<typeof naverConfig>,
    private readonly slackWebhook: SlackWebhook,
    private readonly newsRefiner: NewsRefiner,
  ) {}

  async getNaverData(newsType: NEWSTYPE): Promise<HttpResponse | unknown> {
    try {
      const configuration: AxiosRequestConfig = this.getNaverApiConfiguration(newsType);
      const response = await axios.get(configuration.url, { headers: configuration.headers });
      const json = new XMLParser().parse(response.data);
      return new HttpResponse(response.status, json.rss.channel.item, 'success');
    } catch (error) {
      console.error(error);
    }
  }

  getNaverApiConfiguration(newsType: NEWSTYPE): AxiosRequestConfig {
    const querystring = `${encodeURI(newsType)}&display=30&start=1&sort=date`;
    return {
      url: `${this.naverconfig.openapi_url}${querystring}`,
      headers: {
        'X-Naver-Client-Id': this.naverconfig.client_id,
        'X-Naver-Client-Secret': this.naverconfig.client_secret,
      },
    };
  }

  async getNews(newsTYpe: NEWSTYPE, data: Array<News>) {
    const news: Array<News> = new Array<News>();
    for (const item of data) {
      if (item.title.includes(newsTYpe)) {
        news.push(item);
      }
    }

    return news;
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

  async makeEmptyKeywordFile() {
    await fs.writeFileSync('src/data/keyword/breakingKeyword.txt', '');
  }

  async setLastReceivedTime(firstItemPubDate: string) {
    await fs.writeFileSync('src/data/time/breakingLastReceivedTime.txt', firstItemPubDate);
  }

  async getLastReceivedTime() {
    return await fs.readFileSync('src/data/time/breakingLastReceivedTime.txt', { encoding: 'utf8' });
  }

  async checkNewsPubDate(news: News): Promise<boolean> {
    const lastReceivedTime = await this.getLastReceivedTime();

    return new Date(lastReceivedTime) < new Date(news.pubDate);
  }

  async checkNewsKeyword(news: News): Promise<boolean> {
    let containCount = 0;
    const rawKeywords = await fs.readFileSync('src/data/keyword/breakingKeyword.txt', { encoding: 'utf8' });
    const keywords: string[] = rawKeywords.split(',');
    const title = news.title.replace(' ', '');
    for (const keyword of keywords) {
      if (title.includes(keyword)) containCount++;
    }

    // 중복되는 키워드가 5개 이상일 경우 메세지를 발송하지 않도록 설정
    return containCount >= 3 ? false : true;
  }

  async checkNewsJustified(news: News): Promise<boolean> {
    const pubDateStatus: boolean = await this.checkNewsPubDate(news);
    const keywordStatus: boolean = await this.checkNewsKeyword(news);

    return pubDateStatus && keywordStatus;
  }

  async setKeyword(news: News) {
    const savedRawKeywords = await fs.readFileSync('src/data/keyword/breakingKeyword.txt', { encoding: 'utf8' });
    let rawKeywords = '';
    for (const keyword of news.title.split(' ')) {
      if (savedRawKeywords.includes(keyword) == false) {
        rawKeywords += `${keyword},`;
      }
    }

    await fs.appendFileSync('src/data/keyword/breakingKeyword.txt', rawKeywords, { encoding: 'utf8' });
  }

  async sendNaverNewsToSlack(news: Array<News>): Promise<HttpResponse> {
    const firstItemPubDate: string = news[0].pubDate;

    for (const item of news.reverse()) {
      if (await this.checkNewsJustified(item)) {
        try {
          // 데이터 정제하는 부분
          item.title = this.newsRefiner.htmlParsingToText(item.title);
          item.pubDate = this.newsRefiner.pubDateToKoreaTime(item.pubDate);
          item.description = this.newsRefiner.htmlParsingToText(item.description);
          item.company = this.newsRefiner.substractComapny(item.link, item.originallink);

          // 메세지 폼 만드는 부분
          const payload = await this.refineNews(item);

          // 메세지 전송
          await this.slackWebhook.breakingNewsSend(payload);

          // 키워드 설정
          await this.setKeyword(item);
        } catch (error) {
          console.error(error);
        }
      }
    }

    await this.setLastReceivedTime(firstItemPubDate);

    console.log(`${new Date()}->breakingNewsCron`);

    return {
      status: 200,
      message: 'success',
      data: '',
    };
  }
}
