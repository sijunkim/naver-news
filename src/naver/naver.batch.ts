import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { News } from 'src/entity/news';
import { BreakingNewsService } from './breaking-news.service';
import { ExclusiveNewsService } from './exclusive-news.service';

@Injectable()
export default class NaverBatch {
  constructor(
    private readonly breakingNewsService: BreakingNewsService,
    private readonly exclusiveNewsService: ExclusiveNewsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async breakingNewsCron() {
    const result = await this.breakingNewsService.getNaverNews('속보');
    const breakingNews: Array<News> = await this.breakingNewsService.getBreakingNews(result.data);
    console.log(breakingNews);
    if (breakingNews.length > 0) await this.breakingNewsService.sendNaverNewsToSlack(breakingNews);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async exclusiveNewsCron() {
    const result = await this.exclusiveNewsService.getNaverNews('단독');
    const exclusiveNews: Array<News> = await this.exclusiveNewsService.getExclusiveNews(result.data);
    console.log(exclusiveNews);
    if (exclusiveNews.length > 0) await this.exclusiveNewsService.sendNaverNewsToSlack(exclusiveNews);
  }

  // @Cron(CronExpression.EVERY_2_HOURS)
  // async makeKeywordFilesCron() {
  //   await this.naverService.makeEmptyKeywordFile();
  // }
}
