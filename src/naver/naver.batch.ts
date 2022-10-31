import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NaverService } from './naver.service';

@Injectable()
export default class NaverBatch {
  constructor(private readonly naverService: NaverService) {}
  @Cron(CronExpression.EVERY_MINUTE)
  async breakingNews() {
    const result = await this.naverService.getNaverNews('속보');
    const breakingNews = await this.naverService.getBreakingNews(result.data);
    await this.naverService.sendNaverNewsToSlack(breakingNews);
  }
}
