import { Controller, Get, Param, Post } from '@nestjs/common';
import { BreakingNewsService } from './breaking-news.service';
import { ExclusiveNewsService } from './exclusive-news.service';

@Controller('naver')
export class NaverController {
  constructor(
    private readonly breakingNewsService: BreakingNewsService,
    private readonly exclusiveNewsService: ExclusiveNewsService,
  ) {}

  @Get('news/:keyword')
  async getNaverNews(@Param('keyword') keyword: string): Promise<any> {
    return await this.breakingNewsService.getNaverNews(keyword);
  }

  @Post('news/bot/slack/:keyword')
  async sendNaverNewsToSlack(@Param('keyword') keyword: string): Promise<any> {
    const result = await this.breakingNewsService.getNaverNews(keyword);
    return await this.breakingNewsService.sendNaverNewsToSlack(result.data);
  }
}
