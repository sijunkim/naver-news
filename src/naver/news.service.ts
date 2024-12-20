import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { ConfigType } from '@nestjs/config';
import { HttpResponse } from 'src/entity/httpResponse';
import { XMLParser } from 'fast-xml-parser';
import { News } from 'src/entity/news';
import SlackWebhook from 'src/common/util/slackWebhook';
import NewsRefiner from 'src/common/util/newsRefiner';
import * as fs from 'fs';
import { BreakingNewsType, ExclusiveNewsType, NEWSTYPE } from '../common/type/naver';
import * as configModule from '../config/configModule';
import { IncomingWebhookSendArguments } from '@slack/webhook';
import * as dayjs from 'dayjs';

@Injectable()
export class NewsService implements OnModuleInit {
  onModuleInit() {
    const breakingExceptKeywordFilePath = this.getExceptKeywordFilePath(BreakingNewsType);
    if (!fs.existsSync(breakingExceptKeywordFilePath)) {
      fs.writeFileSync(breakingExceptKeywordFilePath, '');
      console.log(`breakingExceptKeywordFilePath created.`);
    }

    const exclusiveExceptKeywordFilePath = this.getExceptKeywordFilePath(ExclusiveNewsType);
    if (!fs.existsSync(exclusiveExceptKeywordFilePath)) {
      fs.writeFileSync(exclusiveExceptKeywordFilePath, '');
      console.log(`exclusiveExceptKeywordFilePath created.`);
    }

    const breakingKeywordFilePath = this.getKeywordFilePath(BreakingNewsType);
    if (!fs.existsSync(breakingKeywordFilePath)) {
      fs.writeFileSync(breakingKeywordFilePath, '');
      console.log(`breakingKeywordFilePath created.`);
    }

    const exclusiveKeywordFilePath = this.getKeywordFilePath(ExclusiveNewsType);
    if (!fs.existsSync(exclusiveKeywordFilePath)) {
      fs.writeFileSync(exclusiveKeywordFilePath, '');
      console.log(`exclusiveKeywordFilePath created.`);
    }

    const exceptCompanyFilePath = this.getExceptCompanyFilePath();
    if (!fs.existsSync(exceptCompanyFilePath)) {
      fs.writeFileSync(exceptCompanyFilePath, '');
      console.log(`exceptCompanyFilePath created.`);
    }

    const breakingLastReceivedTimeFilePath = this.getLastReceivedTimeFilePath(BreakingNewsType);
    if (!fs.existsSync(breakingLastReceivedTimeFilePath)) {
      fs.writeFileSync(breakingLastReceivedTimeFilePath, '');
      console.log(`breakingLastReceivedTimeFilePath created.`);
    }

    const exclusiveLastReceivedTimeFilePath = this.getLastReceivedTimeFilePath(ExclusiveNewsType);
    if (!fs.existsSync(exclusiveLastReceivedTimeFilePath)) {
      fs.writeFileSync(exclusiveLastReceivedTimeFilePath, '');
      console.log(`exclusiveLastReceivedTimeFilePath created.`);
    }
  }

  constructor(
    @Inject(configModule.fileConfig.KEY)
    private fileConfig: ConfigType<typeof configModule.fileConfig>,
    @Inject(configModule.naverConfig.KEY)
    private naverConfig: ConfigType<typeof configModule.naverConfig>,
    @Inject(configModule.newsConfig.KEY)
    private newsConfig: ConfigType<typeof configModule.newsConfig>,

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

  async setLastReceivedTimeFileToEmpty(newsType: NEWSTYPE) {
    const filePath: string = this.getLastReceivedTimeFilePath(newsType);

    await fs.writeFileSync(filePath, '');
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

  getExceptCompanyFilePath(): string {
    return this.fileConfig.exceptCompany;
  }

  async checkNewsPubDate(newsType: NEWSTYPE, news: News): Promise<boolean> {
    const lastReceivedTime = await this.getLastReceivedTime(newsType);

    return lastReceivedTime === '' || new Date(lastReceivedTime) < new Date(news.pubDate);
  }

  async checkNewsKeyword(newsType: NEWSTYPE, news: News): Promise<boolean> {
    let count = 0;
    const duplicationKeywords = [];
    const rawKeywords = await this.getRawKeywords(newsType);
    const keywords: string[] = rawKeywords.split(',').filter((keyword) => keyword != '');
    const duplicatedCount = this.newsConfig.duplicatedCount;
    for (const keyword of keywords) {
      // 중복되는 키워드가 3개 이상일 경우 메세지를 발송하지 않도록 설정
      if (count > duplicatedCount) {
        console.log(
          `${dayjs(new Date()).format('YYYY-MM-DD HH:mm')} -> 중복 ${newsType} 키워드 : ${duplicationKeywords}`,
        );
        return false;
      }

      if (news.title.replace(' ', '').includes(keyword)) {
        duplicationKeywords.push(keyword);
        count++;
      }
    }

    // 키워드 설정
    await this.setKeywords(newsType, news);

    return true;
  }

  async checkNewsExcept(newsType: NEWSTYPE, news: News): Promise<boolean> {
    const rawKeywords = await this.getRawExceptKeywords(newsType);
    if (rawKeywords === '') return true;

    const keywords: string[] = rawKeywords.split(',');
    const title = news.title.replaceAll(' ', '');
    for (const keyword of keywords) {
      if (keyword !== '' && title.includes(keyword)) {
        return false;
      }
    }
    return true;
  }

  async checkNewsCompany(newsType: NEWSTYPE, news: News): Promise<boolean> {
    const rawCompanies = await this.getRawExceptCompanies();
    if (rawCompanies === '') return true;

    const companies: string[] = rawCompanies.split(',');
    const companyLink = news.originallink;
    for (const company of companies) {
      if (companyLink.includes(company)) return false;
    }
    return true;
  }

  async checkNewsJustified(newsType: NEWSTYPE, news: News): Promise<boolean> {
    const pubDateStatus: boolean = await this.checkNewsPubDate(newsType, news);
    const keywordStatus: boolean = await this.checkNewsKeyword(newsType, news);
    const exceptStatus: boolean = await this.checkNewsExcept(newsType, news);
    const companyStatus: boolean = await this.checkNewsCompany(newsType, news);

    return pubDateStatus && keywordStatus && exceptStatus && companyStatus;
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

  async getRawExceptCompanies(): Promise<string> {
    const filePath: string = this.getExceptCompanyFilePath();
    const rawCompanies = await fs.readFileSync(filePath, { encoding: 'utf8' });

    return rawCompanies;
  }

  async setKeywords(newsType: NEWSTYPE, news: News) {
    const filePath: string = this.getKeywordFilePath(newsType);
    const savedRawKeywords = await fs.readFileSync(filePath, { encoding: 'utf8' });
    let rawKeywords = '';
    news.title.split(' ').forEach((keyword) => {
      if (savedRawKeywords.includes(keyword) == false) {
        rawKeywords += `${keyword
          .replace('[<b>속보</b>]', '')
          .replace('(<b>속보</b>)', '')
          .replace('<b>속보</b>', '')
          .replace('[<b>단독</b>]', '')
          .replace('(<b>단독</b>)', '')
          .replace('<b>단독</b>', '')},`;
      }
    });
    await fs.appendFileSync(filePath, rawKeywords, { encoding: 'utf8' });
  }

  async getJustifiedNews(newsType: NEWSTYPE, news: Array<News>): Promise<Array<News>> {
    const justifiedNews: Array<News> = new Array<News>();
    for await (const item of news.reverse()) {
      const result = await this.checkNewsJustified(newsType, item);
      if (result) justifiedNews.push(item);
    }

    return justifiedNews;
  }

  async sendNewsToSlack(newsType: NEWSTYPE, news: Array<News>): Promise<HttpResponse | unknown> {
    if (news.length > 0) {
      const firstItemPubDate = news[news.length - 1].pubDate;

      for await (const item of news) {
        try {
          // 데이터 정제
          item.title = this.newsRefiner.htmlParsingToText(item.title);
          item.pubDate = this.newsRefiner.pubDateToKoreaTime(item.pubDate);
          item.description = this.newsRefiner.htmlParsingToText(item.description);
          item.company = this.newsRefiner.substractComapny(item.link, item.originallink);
          const payload: IncomingWebhookSendArguments = this.newsRefiner.getRefineNews(item);

          // 메세지 전송
          await this.slackWebhook.newsSend(newsType, payload);
        } catch (error) {
          console.error(error);
          console.log(`${dayjs(new Date()).format('YYYY-MM-DD HH:mm')} -> ${newsType} error`);
        }
      }
      await this.setLastReceivedTime(newsType, dayjs(firstItemPubDate).format('YYYY-MM-DD HH:mm'));
    }
    console.log(`${dayjs(new Date()).format('YYYY-MM-DD HH:mm')} -> ${newsType} 뉴스 전송 완료`);

    return {
      status: 200,
      message: 'success',
      data: '',
    };
  }

  async resetNaverNewsKeyword() {
    await this.setKeywordFileToEmpty(BreakingNewsType);
    await this.setKeywordFileToEmpty(ExclusiveNewsType);
  }

  async resetNaverNewsTime() {
    await this.setLastReceivedTimeFileToEmpty(BreakingNewsType);
    await this.setLastReceivedTimeFileToEmpty(ExclusiveNewsType);
  }

  async deleteNaverNewsKeyword(): Promise<HttpResponse | unknown> {
    await this.resetNaverNewsKeyword();

    return {
      status: 200,
      message: 'success',
      data: '',
    };
  }

  async deleteNaverNewsTime(): Promise<HttpResponse | unknown> {
    await this.resetNaverNewsTime();

    return {
      status: 200,
      message: 'success',
      data: '',
    };
  }
}
