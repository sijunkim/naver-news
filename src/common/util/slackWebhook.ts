import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { IncomingWebhookSendArguments } from '@slack/webhook';
import { IncomingWebhook } from '@slack/webhook';
import SLACKCONFIG from 'src/config/slackConfig';
import { BreakingNewsType, NEWSTYPE } from '../type/naver';

@Injectable()
export default class SlackWebhook {
  constructor(
    @Inject(SLACKCONFIG.KEY)
    private slackConfig: ConfigType<typeof SLACKCONFIG>,
  ) {}

  async newsSend(newsType: NEWSTYPE, payloads: IncomingWebhookSendArguments) {
    let webhook: IncomingWebhook = undefined;

    // NEWSBOT
    const breakingNewsWebhookUrl: string = this.slackConfig.breakingNewsWebhookUrl;
    const exclusiveNewsWebhookUrl: string = this.slackConfig.exclusiveNewsWebhookUrl;
    const url: string = newsType == BreakingNewsType ? breakingNewsWebhookUrl : exclusiveNewsWebhookUrl;
    webhook = new IncomingWebhook(url);
    await webhook.send(payloads);

    // // CHAINPARTNERS
    // webhook = new IncomingWebhook(this.slackConfig.chainpartnersNewsWebhookUrl);
    // await webhook.send(payloads);

    // // TEST
    // webhook = new IncomingWebhook(this.slackConfig.developWebhookUrl);
    // await webhook.send(payloads);
  }
}
