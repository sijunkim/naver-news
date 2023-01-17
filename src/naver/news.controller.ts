import { Controller, Get, Param, Post } from '@nestjs/common';
import { HttpResponse } from 'src/entity/httpResponse';
import { NEWSTYPE } from 'src/common/type/naver';
import { NewsService } from './news.service';

@Controller('naver')
export class NaverController {
  constructor(private readonly newsService: NewsService) {}

  @Get('news/:keyword')
  async getNaverNews(@Param('keyword') newsType: NEWSTYPE): Promise<any> {
    return await this.newsService.getNaverData(newsType);
  }

  @Post('news/bot/slack/:keyword')
  async sendNaverNewsToSlack(@Param('keyword') newsType: NEWSTYPE): Promise<any> {
    const result: HttpResponse = await this.newsService.getNaverData(newsType);
    return await this.newsService.sendNewsToSlack(newsType, result.data);
  }
}
