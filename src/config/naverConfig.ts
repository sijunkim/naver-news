import { registerAs } from '@nestjs/config';

export default registerAs('naver', () => ({
  clienId: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
  openapiUrl: process.env.NAVER_OPENAPI_URL,
}));
