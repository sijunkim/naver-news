import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { IncomingWebhookSendArguments } from '@slack/webhook';
import { IncomingWebhook } from '@slack/webhook';
import SLACKCONFIG from 'src/config/slackConfig';
import { BreakingNewsType, NEWSTYPE } from '../type/naver';
import UtilService from '../service/utilService';

@Injectable()
export default class SlackWebhook {
  constructor(
    @Inject(SLACKCONFIG.KEY)
    private slackConfig: ConfigType<typeof SLACKCONFIG>,
    private utilService: UtilService,
  ) {}

  async newsSend(newsType: NEWSTYPE, payloads: IncomingWebhookSendArguments) {
    let webhook: IncomingWebhook = undefined;

    // Production
    if (UtilService.isProduction()) {
      // NEWSBOT
      const breakingNewsWebhookUrl: string = this.slackConfig.breakingNewsWebhookUrl;
      const exclusiveNewsWebhookUrl: string = this.slackConfig.exclusiveNewsWebhookUrl;
      const url: string = newsType == BreakingNewsType ? breakingNewsWebhookUrl : exclusiveNewsWebhookUrl;
      webhook = new IncomingWebhook(url);
      await webhook.send(payloads);
    }

    // Debug, Develop
    if (UtilService.isDebug() || UtilService.isDevelop()) {
      webhook = new IncomingWebhook(this.slackConfig.developWebhookUrl);
      await webhook.send(payloads);
    }
  }
}
