require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  dbPath: process.env.DB_PATH || './database.sqlite',
  mlSearchKeyword: process.env.ML_SEARCH_KEYWORD || 'ofertas',
  mlCategory: process.env.ML_CATEGORY || '',
  cronCaptureSchedule: process.env.CRON_CAPTURE_SCHEDULE || '0 * * * *',
  cronPublishSchedule: process.env.CRON_PUBLISH_SCHEDULE || '*/10 * * * *',
  whatsappTargetNumber: process.env.WHATSAPP_TARGET_NUMBER || '',
  whatsappTargetGroup: process.env.WHATSAPP_TARGET_GROUP || '',
  mlAffiliateTag: process.env.ML_AFFILIATE_TAG || '',
};
