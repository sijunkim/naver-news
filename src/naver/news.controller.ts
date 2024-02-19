import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { HttpResponse } from 'src/entity/httpResponse';
import { NEWSTYPE } from 'src/common/type/naver';
import { NewsService } from './news.service';
import NewsBatch from './news.batch';

@Controller('naver')
export class NaverController {
  constructor(private readonly newsService: NewsService, private readonly newsBatch: NewsBatch) {}

  @Get('news/breaking')
  async sendBreakingNews() {
    await this.newsBatch.breakingNewsTimeout();
  }

  @Get('news/exclusive')
  async sendExclusiveNews() {
    await this.newsBatch.exclusiveNewsTimeout();
  }

  @Get('news/:keyword')
  async getNaverNews(@Param('keyword') newsType: NEWSTYPE): Promise<any> {
    return await this.newsService.getNaverData(newsType);
  }

  @Post('news/bot/slack/:keyword')
  async sendNaverNewsToSlack(@Param('keyword') newsType: NEWSTYPE): Promise<any> {
    const result: HttpResponse = await this.newsService.getNaverData(newsType);

    return await this.newsService.sendNewsToSlack(newsType, result.data);
  }

  @Delete('news/data')
  async resetNaverNewsData(): Promise<boolean | unknown> {
    const keywordResult: HttpResponse = await this.newsService.deleteNaverNewsKeyword();
    const timeResult: HttpResponse = await this.newsService.deleteNaverNewsTime();

    return keywordResult.status === 200 && timeResult.status === 200 ? true : false;
  }

  @Delete('news/keyword')
  async deleteNaverNewsKeyword(): Promise<HttpResponse> {
    const result: HttpResponse = await this.newsService.deleteNaverNewsKeyword();

    return result;
  }

  @Delete('news/time')
  async deleteNaverNewsTime(): Promise<HttpResponse> {
    const result: HttpResponse = await this.newsService.deleteNaverNewsTime();

    return result;
  }
}
