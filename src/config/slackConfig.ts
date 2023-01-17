import { registerAs } from '@nestjs/config';

export default registerAs('slack', () => ({
  breakingNewsWebhookUrl: process.env.BREAKING_NEWS_WEBHOOK_URL,
  exclusiveNewsWebhookUrl: process.env.EXCLUSIVE_NEWS_WEBHOOK_URL,
  chainpartnersNewsWebhookUrl: process.env.CHAINPARTNERS_WEBHOOK_URL,
}));
