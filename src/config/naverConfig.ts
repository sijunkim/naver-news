import { registerAs } from '@nestjs/config';

export default registerAs('naver', () => ({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  openapi_url: process.env.OPENAPI_URI,
}));
