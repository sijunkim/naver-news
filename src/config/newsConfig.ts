import { registerAs } from '@nestjs/config';

export default registerAs('news', () => ({
  duplicatedCount: Number(process.env.DUPLICATED_COUNT),
}));
