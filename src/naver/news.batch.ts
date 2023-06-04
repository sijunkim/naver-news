import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { News } from 'src/entity/news';
import { HttpResponse } from 'src/entity/httpResponse';
import { NewsService } from './news.service';
import { BreakingNewsType, ExclusiveNewsType } from '../common/type/naver';
import UtilService from 'src/common/service/utilService';

@Injectable()
export default class NewsBatch {
  constructor(private readonly newsService: NewsService) {}

  @Timeout(0)
  async breakingNewsTimeout() {
    if (UtilService.isDebug()) {
      const result: HttpResponse = await this.newsService.getNaverData(BreakingNewsType);
      const news: Array<News> = await this.newsService.getNews(BreakingNewsType, result.data);
      const justifiedNews = await this.newsService.getJustifiedNews(BreakingNewsType, news);
      if (justifiedNews.length > 0) await this.newsService.sendNewsToSlack(BreakingNewsType, justifiedNews);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async breakingNewsCron() {
    if (UtilService.isProduction()) {
      const result: HttpResponse = await this.newsService.getNaverData(BreakingNewsType);
      const news: Array<News> = await this.newsService.getNews(BreakingNewsType, result.data);
      const justifiedNews = await this.newsService.getJustifiedNews(BreakingNewsType, news);
      if (justifiedNews.length > 0) await this.newsService.sendNewsToSlack(BreakingNewsType, justifiedNews);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async exclusiveNewsCron() {
    if (UtilService.isProduction()) {
      const result: HttpResponse = await this.newsService.getNaverData(ExclusiveNewsType);
      const news: Array<News> = await this.newsService.getNews(ExclusiveNewsType, result.data);
      const justifiedNews = await this.newsService.getJustifiedNews(ExclusiveNewsType, news);
      if (news.length > 0) await this.newsService.sendNewsToSlack(ExclusiveNewsType, justifiedNews);
    }
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async makeKeywordFilesCron() {
    if (UtilService.isProduction()) {
      await this.newsService.resetNaverNewsKeyword();
    }
  }
}
