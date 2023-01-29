import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { ConfigType } from '@nestjs/config';
import { HttpResponse } from 'src/entity/httpResponse';
import { XMLParser } from 'fast-xml-parser';
import { News } from 'src/entity/news';
import SlackWebhook from 'src/common/util/slackWebhook';
import NewsRefiner from 'src/common/util/newsRefiner';
import * as fs from 'fs';
import { BreakingNewsType, DuplicationCount, NEWSTYPE } from '../common/type/naver';
import * as configModule from '../config/configModule';
import { IncomingWebhookSendArguments } from '@slack/webhook';

@Injectable()
export class NewsService {
  constructor(
    @Inject(configModule.fileConfig.KEY)
    private fileConfig: ConfigType<typeof configModule.fileConfig>,
    @Inject(configModule.naverConfig.KEY)
    private naverConfig: ConfigType<typeof configModule.naverConfig>,
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
    const url = `${this.naverConfig.openapiUrl}${encodeURI(newsType)}&display=30&start=1&sort=date`;
    const clientId = this.naverConfig.clienId;
    const clientSecret = this.naverConfig.clientSecret;
    const headers = { 'X-Naver-Client-Id': clientId, 'X-Naver-Client-Secret': clientSecret };

    return { url: url, headers: headers };
  }

  async getNews(newsType: NEWSTYPE, data: Array<News>) {
    const news: Array<News> = new Array<News>();
    for (const item of data) {
      if (item.title.includes(newsType)) {
        news.push(item);
      }
    }

    return news;
  }

  async setKeywordFileToEmpty(newsType: NEWSTYPE) {
    const filePath: string = this.getKeywordFilePath(newsType);
    await fs.writeFileSync(filePath, '');
  }

  getKeywordFilePath(newsType: NEWSTYPE): string {
    const breakingKeywordFile: string = this.fileConfig.breakingKeyword;
    const exclusiveKeywordFile: string = this.fileConfig.exclusiveKeyword;
    const filePath: string = newsType == BreakingNewsType ? breakingKeywordFile : exclusiveKeywordFile;

    return filePath;
  }

  getLastReceivedTimeFilePath(newsType: NEWSTYPE): string {
    const breakingLastTimeFile: string = this.fileConfig.breakingLastReceivedTime;
    const exclusiveLastTimeFile: string = this.fileConfig.exclusiveLastReceivedTime;
    const filePath: string = newsType == BreakingNewsType ? breakingLastTimeFile : exclusiveLastTimeFile;

    return filePath;
  }

  async setLastReceivedTime(newsType: NEWSTYPE, firstItemPubDate: string) {
    const filePath: string = this.getLastReceivedTimeFilePath(newsType);

    await fs.writeFileSync(filePath, firstItemPubDate);
  }

  async getLastReceivedTime(newsType: NEWSTYPE) {
    const filePath: string = this.getLastReceivedTimeFilePath(newsType);

    return await fs.readFileSync(filePath, { encoding: 'utf8' });
  }

  getExceptKeywordFilePath(newsType: NEWSTYPE): string {
    const breakingExceptKeywordFile: string = this.fileConfig.breakingExceptKeyword;
    const exclusiveExceptKeywordFile: string = this.fileConfig.exclusiveExceptKeyword;
    const filePath: string = newsType == BreakingNewsType ? breakingExceptKeywordFile : exclusiveExceptKeywordFile;

    return filePath;
  }

  async checkNewsPubDate(newsType: NEWSTYPE, news: News): Promise<boolean> {
    const lastReceivedTime = await this.getLastReceivedTime(newsType);

    return new Date(lastReceivedTime) < new Date(news.pubDate);
  }

  async checkNewsKeyword(newsType: NEWSTYPE, news: News): Promise<boolean> {
    const rawKeywords = await this.getRawKeywords(newsType);
    const keywords: string[] = rawKeywords.split(',');

    // 중복되는 키워드가 3개 이상일 경우 메세지를 발송하지 않도록 설정
    return keywords.filter((keyword) => news.title.replace(' ', '').includes(keyword)).length < DuplicationCount;
  }

  async checkNewsExcept(newsType: NEWSTYPE, news: News): Promise<boolean> {
    const rawKeywords = await this.getRawExceptKeywords(newsType);
    const keywords: string[] = rawKeywords.split(',');
    const title = news.title.replaceAll(' ', '');
    for (const keyword of keywords) {
      if (title.includes(keyword)) return false;
    }
    return true;
  }

  async checkNewsJustified(newsType: NEWSTYPE, news: News): Promise<boolean> {
    const pubDateStatus: boolean = await this.checkNewsPubDate(newsType, news);
    const keywordStatus: boolean = await this.checkNewsKeyword(newsType, news);
    const exceptStatus: boolean = await this.checkNewsExcept(newsType, news);

    return pubDateStatus && keywordStatus && exceptStatus;
  }

  async getRawKeywords(newsType: NEWSTYPE): Promise<string> {
    const filePath: string = this.getKeywordFilePath(newsType);
    const rawKeywords = await fs.readFileSync(filePath, { encoding: 'utf8' });

    return rawKeywords;
  }

  async getRawExceptKeywords(newsType: NEWSTYPE): Promise<string> {
    const filePath: string = this.getExceptKeywordFilePath(newsType);
    const rawKeywords = await fs.readFileSync(filePath, { encoding: 'utf8' });

    return rawKeywords;
  }

  async setKeywords(newsType: NEWSTYPE, news: News) {
    const filePath: string = this.getKeywordFilePath(newsType);
    const savedRawKeywords = await fs.readFileSync(filePath, { encoding: 'utf8' });
    let rawKeywords = '';
    news.title.split(' ').forEach((keyword) => {
      if (savedRawKeywords.includes(keyword) == false) {
        rawKeywords += `${keyword},`;
      }
    });
    await fs.appendFileSync(filePath, rawKeywords, { encoding: 'utf8' });
  }

  async getJustifiedNews(newsType: NEWSTYPE, news: Array<News>): Promise<Array<News>> {
    const justifiedNews: Array<News> = news
      .filter(async (item) => (await this.checkNewsJustified(newsType, item)) === true)
      .map((item) => item)
      .reverse();

    return justifiedNews;
  }

  async sendNewsToSlack(newsType: NEWSTYPE, news: Array<News>): Promise<HttpResponse | unknown> {
    for (const item of news) {
      try {
        // 데이터 정제
        item.title = this.newsRefiner.htmlParsingToText(item.title);
        item.pubDate = this.newsRefiner.pubDateToKoreaTime(item.pubDate);
        item.description = this.newsRefiner.htmlParsingToText(item.description);
        item.company = this.newsRefiner.substractComapny(item.link, item.originallink);
        const payload: IncomingWebhookSendArguments = this.newsRefiner.getRefineNews(item);

        // 메세지 전송
        await this.slackWebhook.newsSend(newsType, payload);
        // 키워드 설정
        await this.setKeywords(newsType, item);
      } catch (error) {
        console.error(error);
      }
    }

    await this.setLastReceivedTime(newsType, news[0].pubDate);

    console.log(`${new Date()}->${newsType}`);

    return {
      status: 200,
      message: 'success',
      data: '',
    };
  }
}
