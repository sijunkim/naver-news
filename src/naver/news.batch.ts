import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { News } from 'src/entity/news';
import { HttpResponse } from 'src/entity/httpResponse';
import { NewsService } from './news.service';
import { BreakingNewsType, ExclusiveNewsType, DEBUG, PRODUCTION } from '../common/type/naver';

@Injectable()
export default class NewsBatch {
  constructor(private readonly newsService: NewsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async breakingNewsCron() {
    if (process.env.NODE_ENV == DEBUG || process.env.NODE_ENV == PRODUCTION) {
      const result: HttpResponse = await this.newsService.getNaverData(BreakingNewsType);
      const news: Array<News> = await this.newsService.getNews(BreakingNewsType, result.data);
      const justifiedNews = await this.newsService.getJustifiedNews(BreakingNewsType, news);
      if (justifiedNews.length > 0) await this.newsService.sendNewsToSlack(BreakingNewsType, justifiedNews);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async exclusiveNewsCron() {
    if (process.env.NODE_ENV == DEBUG || process.env.NODE_ENV == PRODUCTION) {
      const result: HttpResponse = await this.newsService.getNaverData(ExclusiveNewsType);
      const news: Array<News> = await this.newsService.getNews(ExclusiveNewsType, result.data);
      const justifiedNews = await this.newsService.getJustifiedNews(ExclusiveNewsType, news);
      if (news.length > 0) await this.newsService.sendNewsToSlack(ExclusiveNewsType, justifiedNews);
    }
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async makeKeywordFilesCron() {
    await this.newsService.resetNaverNewsKeyword();
  }
}
