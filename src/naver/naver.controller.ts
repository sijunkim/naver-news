import { Controller, Get, Param } from '@nestjs/common';
import { NaverService } from './naver.service';

@Controller('naver')
export class NaverController {
  constructor(private readonly naverService: NaverService) {}

  @Get('news/:keyword')
  async getNaverNews(@Param('keyword') keyword: string): Promise<any> {
    return await this.naverService.getNaverNews(keyword);
  }
}
