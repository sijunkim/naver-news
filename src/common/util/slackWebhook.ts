import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { IncomingWebhook } from '@slack/webhook';
import SLACKCONFIG from 'src/config/slackConfig';

@Injectable()
export default class SlackWebhook {
  constructor(
    @Inject(SLACKCONFIG.KEY)
    private slackConfig: ConfigType<typeof SLACKCONFIG>,
  ) {}

  async breakingNewsSend(payload: any) {
    // NEWSBOT
    let webhook = new IncomingWebhook(this.slackConfig.breaking_news_webhook_url);
    await webhook.send(payload);

    // CHAINPARTNERS
    webhook = new IncomingWebhook(this.slackConfig.chainpartners_news_webhook_url);
    await webhook.send(payload);
  }

  async exclusiveNewsSend(payload: any) {
    // NEWSBOT
    let webhook = new IncomingWebhook(this.slackConfig.exclusive_news_webhook_url);
    await webhook.send(payload);

    // CHAINPARTNERS
    webhook = new IncomingWebhook(this.slackConfig.chainpartners_news_webhook_url);
    await webhook.send(payload);
  }
}
