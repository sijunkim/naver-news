import { registerAs } from '@nestjs/config';

export default registerAs('file', () => ({
  breakingKeyword: process.env.BREAKING_KEYWORD,
  breakingLastReceivedTime: process.env.BREAKING_LAST_RECEIVED_TIME,
  breakingExceptKeyword: process.env.BREAKING_EXCEPT_KEYWORD,
  exclusiveKeyword: process.env.EXCLUSIVE_KEYWORD,
  exclusiveLastReceivedTime: process.env.EXCLUSIVE_LAST_RECEIVED_TIME,
  exclusiveExceptKeyword: process.env.EXCLUSIVE_EXCEPT_KEYWORD,
  exceptCompany: process.env.EXCEPT_COMPANY,
}));
