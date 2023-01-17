import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import * as configModule from './config/configModule';
import { validationSchema } from './config/validationSchema';
import { NaverController } from './naver/news.controller';
import { BreakingNewsService } from './naver/breaking-news.service';
import { ExclusiveNewsService } from './naver/exclusive-news.service';
import SlackWebhook from './common/util/slackWebhook';
import NewsRefiner from './common/util/newsRefiner';
import NewsBatch from './naver/news.batch';
import { ScheduleModule } from '@nestjs/schedule';
import { NewsService } from './naver/news.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configModule.fileConfig, configModule.naverConfig, configModule.slackConfig],
      isGlobal: true,
      validationSchema,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, NaverController],
  providers: [AppService, NewsService, BreakingNewsService, ExclusiveNewsService, NewsBatch, SlackWebhook, NewsRefiner],
})
export class AppModule {}
