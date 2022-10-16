import { Controller, Get, Param, Post } from '@nestjs/common';
import { NaverService } from './naver.service';

@Controller('naver')
export class NaverController {
  constructor(private readonly naverService: NaverService) {}

  @Get('news/:keyword')
  async getNaverNews(@Param('keyword') keyword: string): Promise<any> {
    return await this.naverService.getNaverNews(keyword);
  }

  @Post('news/bot/slack/:keyword')
  async sendNaverNewsToSlack(@Param('keyword') keyword: string): Promise<any> {
    const result = await this.naverService.getNaverNews(keyword);
    return await this.naverService.postNaverNewsToSlack(result.data);
  }
}
