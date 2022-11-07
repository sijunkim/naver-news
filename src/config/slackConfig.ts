import { registerAs } from '@nestjs/config';

export default registerAs('slack', () => ({
  breaking_news_webhook_url: process.env.BREAKING_NEWS_WEBHOOK_URL,
  exclusive_news_webhook_url: process.env.EXCLUSIVE_NEWS_WEBHOOK_URL,
}));
