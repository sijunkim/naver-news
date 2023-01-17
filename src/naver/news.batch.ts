import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { News } from 'src/entity/news';
import { HttpResponse } from 'src/entity/httpResponse';
import { BreakingNewsService } from './breaking-news.service';
import { ExclusiveNewsService } from './exclusive-news.service';
import { NewsService } from './news.service';
import { BreakingNewsType, ExclusiveNewsType, NODE_ENV } from '../common/type/naver';

@Injectable()
export default class NewsBatch {
  constructor(
    private readonly breakingNewsService: BreakingNewsService,
    private readonly exclusiveNewsService: ExclusiveNewsService,
    private readonly newsService: NewsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async breakingNewsCron() {
    if (process.env.NODE_ENV === NODE_ENV) {
      const result: HttpResponse = await this.newsService.getNaverData(BreakingNewsType);
      const news: Array<News> = await this.newsService.getNews(BreakingNewsType, result.data);
      if (news.length > 0) await this.newsService.sendNewsToSlack(BreakingNewsType, news);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async exclusiveNewsCron() {
    if (process.env.NODE_ENV === NODE_ENV) {
      const result: HttpResponse = await this.newsService.getNaverData(ExclusiveNewsType);
      const news: Array<News> = await this.newsService.getNews(ExclusiveNewsType, result.data);
      if (news.length > 0) await this.exclusiveNewsService.sendNaverNewsToSlack(news);
    }
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async makeKeywordFilesCron() {
    await this.breakingNewsService.makeEmptyKeywordFile();
    await this.exclusiveNewsService.makeEmptyKeywordFile();
  }
}
