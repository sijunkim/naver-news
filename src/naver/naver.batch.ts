import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { News } from 'src/entity/news';
import { NaverService } from './naver.service';

@Injectable()
export default class NaverBatch {
  constructor(private readonly naverService: NaverService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async breakingNewsCron() {
    const result = await this.naverService.getNaverNews('속보');
    const breakingNews: Array<News> = await this.naverService.getBreakingNews(result.data);
    await this.naverService.sendNaverNewsToSlack(breakingNews);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async exclusiveNewsCron() {
    const result = await this.naverService.getNaverNews('단독');
    const breakingNews: Array<News> = await this.naverService.getExclusiveNews(result.data);
    await this.naverService.sendNaverNewsToSlack(breakingNews);
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async makeKeywordFilesCron() {
    await this.naverService.makeEmptyKeywordFile();
  }

  // @Cron(CronExpression.EVERY_SECOND)
  // async makeKeywordFilesCron() {
  //   const result = await this.naverService.getNaverNews('속보');
  //   const breakingNews: Array<News> = await this.naverService.getBreakingNews(result.data);
  //   for (const news of breakingNews) {
  //     await this.naverService.setKeyword(news);
  //   }
  // }
}
