import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { IncomingWebhookSendArguments } from '@slack/webhook';
import { IncomingWebhook } from '@slack/webhook';
import SLACKCONFIG from 'src/config/slackConfig';

@Injectable()
export default class SlackWebhook {
  constructor(
    @Inject(SLACKCONFIG.KEY)
    private slackConfig: ConfigType<typeof SLACKCONFIG>,
  ) {}

  async breakingNewsSend(payloads: IncomingWebhookSendArguments) {
    // NEWSBOT
    let webhook = new IncomingWebhook(this.slackConfig.breakingNewsWebhookUrl);
    await webhook.send(payloads);

    // CHAINPARTNERS
    webhook = new IncomingWebhook(this.slackConfig.chainpartnersNewsWebhookUrl);
    await webhook.send(payloads);
  }

  async exclusiveNewsSend(payloads: IncomingWebhookSendArguments) {
    // NEWSBOT
    let webhook = new IncomingWebhook(this.slackConfig.exclusiveNewsWebhookUrl);
    await webhook.send(payloads);

    // CHAINPARTNERS
    webhook = new IncomingWebhook(this.slackConfig.chainpartnersNewsWebhookUrl);
    await webhook.send(payloads);
  }
}
