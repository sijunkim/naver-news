import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { News } from 'src/entity/news';
import { BreakingNewsService } from './breaking-news.service';
import { ExclusiveNewsService } from './exclusive-news.service';
import { BreakingNewsType, ExclusiveNewsType, NODE_ENV } from '../common/type/naver';

@Injectable()
export default class NaverBatch {
  constructor(
    private readonly breakingNewsService: BreakingNewsService,
    private readonly exclusiveNewsService: ExclusiveNewsService,
  ) {}

  // @Cron(CronExpression.EVERY_MINUTE)
  async breakingNewsCron() {
    if (process.env.NODE_ENV === NODE_ENV) {
      const result = await this.breakingNewsService.getNaverNews(BreakingNewsType);
      const breakingNews: Array<News> = await this.breakingNewsService.getBreakingNews(result.data);
      if (breakingNews.length > 0) await this.breakingNewsService.sendNaverNewsToSlack(breakingNews);
    }
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  async exclusiveNewsCron() {
    if (process.env.NODE_ENV === NODE_ENV) {
      const result = await this.exclusiveNewsService.getNaverNews(ExclusiveNewsType);
      const exclusiveNews: Array<News> = await this.exclusiveNewsService.getExclusiveNews(result.data);
      if (exclusiveNews.length > 0) await this.exclusiveNewsService.sendNaverNewsToSlack(exclusiveNews);
    }
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async makeKeywordFilesCron() {
    await this.breakingNewsService.makeEmptyKeywordFile();
    await this.exclusiveNewsService.makeEmptyKeywordFile();
  }
}
