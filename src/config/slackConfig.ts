import { registerAs } from '@nestjs/config';

export default registerAs('slack', () => ({
  breakingNewsWebhookUrl: process.env.BREAKING_NEWS_WEBHOOK_URL,
  exclusiveNewsWebhookUrl: process.env.EXCLUSIVE_NEWS_WEBHOOK_URL,
  developWebhookUrl: process.env.DEVELOP_WEBHOOK_URL,
}));
