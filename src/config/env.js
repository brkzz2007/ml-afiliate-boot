require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'production',
  databaseUrl: process.env.DATABASE_URL,
  dbPath: process.env.DB_PATH || './database.sqlite',
  mlSearchKeyword: process.env.ML_SEARCH_KEYWORD || 'Jogo de Panelas, Frigideira antiaderente, Air fryer, Liquidificador, Cafeteira, Chaleira elétrica, Potes organizadores, Escorredor de louça, Garrafa térmica, Porta temperos, Tábua de corte, Mop giratório, Vassoura e rodo, Balde dobrável, Panos de microfibra, Escova multiuso, Aspirador de pó, Luvas de limpeza, Varal portátil, Cesto de roupa, Prendedores de roupa, Ferro de passar, Tábua de passar, Organizadores de roupa, Travesseiros, Jogos de cama, Cobertor, Cortinas, Tapetes para sala, Caixas organizadoras, Organizador de gaveta, Nichos para parede, Prateleiras, Carrinho organizador, Extensão elétrica, Filtro de linha, Lâmpada LED, Luminária de mesa, Ventilador, Toalhas de banho, Tapete de banheiro, Espelho, Suporte de parede, Jogo de cama casal, Jogo de toalhas, Pufe, Cadeira de escritório, Cama box, Colchão, Rack para TV, Estante de livros, Escrivaninha, Mesa de jantar, Cadeiras de cozinha, Banqueta, Sapateira, Cabide de porta, Organizador de calçados, Penteadeira, Cômoda, Soquete inteligente, Interruptor wifi, Câmera de segurança, Ar condicionado portátil, Umidificador de ar, Purificador de ar, Cooler, Suporte para notebook, Teclado sem fio, Mouse sem fio, Caixa de som bluetooth',
  mlCategory: process.env.ML_CATEGORY || '',
  cronCaptureSchedule: process.env.CRON_CAPTURE_SCHEDULE || '0 * * * *',
  cronPublishSchedule: process.env.CRON_PUBLISH_SCHEDULE || '*/3 * * * *',

  whatsappTargetNumber: process.env.WHATSAPP_TARGET_NUMBER || '5569984520192',
  whatsappTargetGroup: process.env.WHATSAPP_TARGET_GROUP || 'OfertaLar #17',
  mlAffiliateTag: process.env.ML_AFFILIATE_TAG || 'bv20260330080614',
  initialCaptureDelay: 60000,
  publishStartTime: process.env.PUBLISH_START_TIME || '08:00',
  publishEndTime: process.env.PUBLISH_END_TIME || '22:00',
  renderExternalUrl: process.env.RENDER_EXTERNAL_URL || null,
};
