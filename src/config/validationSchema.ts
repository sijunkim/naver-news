import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NAVER_CLIENT_ID: Joi.string().required(),
  NAVER_CLIENT_SECRET: Joi.string().required(),
  NAVER_OPENAPI_URL: Joi.string().required(),

  BREAKING_KEYWORD: Joi.string().required(),
  BREAKING_LAST_RECEIVED_TIME: Joi.string().required(),
  EXCLUSIVE_KEYWORD: Joi.string().required(),
  EXCLUSIVE_LAST_RECEIVED_TIME: Joi.string().required(),
  EXCLUSIVE_EXCEPT_KEYWORD: Joi.string().required(),

  BREAKING_NEWS_WEBHOOK_URL: Joi.string().required(),
  EXCLUSIVE_NEWS_WEBHOOK_URL: Joi.string().required(),
  CHAINPARTNERS_WEBHOOK_URL: Joi.string(),
  DEVELOP_WEBHOOK_URL: Joi.string(),
});
