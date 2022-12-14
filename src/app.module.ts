import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import naverConfig from './config/naverConfig';
import slackConfig from './config/slackConfig';
import { validationSchema } from './config/validationSchema';
import { NaverController } from './naver/naver.controller';
import { BreakingNewsService } from './naver/breaking-news.service';
import { ExclusiveNewsService } from './naver/exclusive-news.service';
import SlackWebhook from './common/util/slackWebhook';
import NewsRefiner from './common/util/newsRefiner';
import NaverBatch from './naver/naver.batch';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [naverConfig, slackConfig],
      isGlobal: true,
      validationSchema,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, NaverController],
  providers: [AppService, BreakingNewsService, ExclusiveNewsService, NaverBatch, SlackWebhook, NewsRefiner],
})
export class AppModule {}
