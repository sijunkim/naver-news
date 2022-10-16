import { registerAs } from '@nestjs/config';

export default registerAs('naver', () => ({
  client_id: process.env.NAVER_CLIENT_ID,
  client_secret: process.env.NAVER_CLIENT_SECRET,
}));
