require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'production',
  databaseUrl: process.env.DATABASE_URL,
  dbPath: process.env.DB_PATH || './database.sqlite',
  mlSearchKeyword: process.env.ML_SEARCH_KEYWORD || 'geladeira, fogão, máquina de lavar, sofá, guarda-roupa, mesa de jantar, sabão líquido, amaciante, eletrodomésticos, móveis',
  mlCategory: process.env.ML_CATEGORY || '',
  cronCaptureSchedule: process.env.CRON_CAPTURE_SCHEDULE || '0 8-23,0 * * *', // Das 05h às 21h BRT (08h às 00h UTC)
  cronPublishSchedule: process.env.CRON_PUBLISH_SCHEDULE || '*/30 8-23,0 * * *', // Das 05h às 21h BRT (08h às 00h UTC)

  whatsappTargetNumber: process.env.WHATSAPP_TARGET_NUMBER || '5569984520192',
  whatsappTargetGroup: process.env.WHATSAPP_TARGET_GROUP || 'ofertas do dia',
  mlAffiliateTag: process.env.ML_AFFILIATE_TAG || 'bv20260330080614',
  initialCaptureDelay: 10000,
};
