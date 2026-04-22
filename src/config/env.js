require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'production',
  databaseUrl: process.env.DATABASE_URL,
  dbPath: process.env.DB_PATH || './database.sqlite',
  mlSearchKeyword: process.env.ML_SEARCH_KEYWORD || 'Fogão, Geladeira, Máquina de lavar, Cama box, Guarda-roupa, Sofá, Smart TV, Air Fryer, Liquidificador, Micro-ondas, Cafeteira, Panelas indução, Jogo de pratos, Faqueiro, Potes herméticos, Mop limpeza, Aspirador de pó, Ventilador, Painel TV, Mesa de jantar, Colchão casal, Travesseiros, Edredom, Toalhas banho, Chuveiro elétrico, Organizadores, Armário de cozinha, Cooktop, Forno elétrico, Batedeira, Sanduicheira, Purificador de água',
  mlCategory: process.env.ML_CATEGORY || '',
  cronCaptureSchedule: process.env.CRON_CAPTURE_SCHEDULE || '0 * * * *',
  cronPublishSchedule: process.env.CRON_PUBLISH_SCHEDULE || '*/3 * * * *',

  whatsappTargetNumber: process.env.WHATSAPP_TARGET_NUMBER || '5569984520192',
  whatsappTargetGroup: process.env.WHATSAPP_TARGET_GROUP || 'OfertaLar #17',
  mlAffiliateTag: process.env.ML_AFFILIATE_TAG || 'bv20260330080614',
  initialCaptureDelay: 10000,
  publishStartTime: process.env.PUBLISH_START_TIME || '08:00',
  publishEndTime: process.env.PUBLISH_END_TIME || '22:00',
  renderExternalUrl: process.env.RENDER_EXTERNAL_URL || null,
};
