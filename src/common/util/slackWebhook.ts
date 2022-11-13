import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { IncomingWebhook } from '@slack/webhook';
import slackConfig from 'src/config/slackConfig';

@Injectable()
export default class SlackWebhook {
  constructor(
    @Inject(slackConfig.KEY)
    private slackconfig: ConfigType<typeof slackConfig>,
  ) {}

  async breakingNewsSend(payload: any) {
    const webhook = new IncomingWebhook(this.slackconfig.breaking_news_webhook_url);
    await webhook.send(payload);
  }

  async exclusiveNewsSend(payload: any) {
    const webhook = new IncomingWebhook(this.slackconfig.exclusive_news_webhook_url);
    await webhook.send(payload);
  }
}
