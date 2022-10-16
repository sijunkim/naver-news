import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import naverConfig from './config/naverConfig';
import { validationSchema } from './config/validationSchema';
import { NaverController } from './naver/naver.controller';
import { NaverService } from './naver/naver.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [naverConfig],
      isGlobal: true,
      validationSchema,
    }),
  ],
  controllers: [AppController, NaverController],
  providers: [AppService, NaverService],
})
export class AppModule {}
