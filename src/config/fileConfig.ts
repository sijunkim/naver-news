import { registerAs } from '@nestjs/config';

export default registerAs('file', () => ({
  breakingKeyword: process.env.BREAKING_KEYWORD,
  exclusiveKeyword: process.env.EXCLUSIVE_KEYWORD,
  breakingLastReceivedTime: process.env.BREAKING_LAST_RECEIVED_TIME,
  exclusiveLastReceivedTime: process.env.EXCLUSIVE_LAST_RECEIVED_TIME,
  breakingExceptKeyword: process.env.BREAKING_EXCEPT_KEYWORD,
  exclusiveExceptKeyword: process.env.EXCLUSIVE_EXCEPT_KEYWORD,
}));
