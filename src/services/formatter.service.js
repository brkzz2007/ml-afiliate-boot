const env = require('../config/env');
const axios = require('axios');
const logger = require('../config/logger');

class FormatterService {
  async formatLink(link) {
    if (!link) return '';
    try {
        // Tenta encurtar via is.gd (grátis e sem API key)
        const response = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(link)}`, { timeout: 5000 });
        if (response.data && response.data.includes('http')) {
            return response.data;
        }
    } catch (err) {
        logger.warn('Falha ao usar encurtador is.gd, usando link /p/ simplificado.');
    }

    // Fallback: Link /p/ oficial (caso o encurtador falhe)
    const mlbMatch = link.match(/(MLB[U]?\d+)/i);
    if (mlbMatch) {
        const productId = mlbMatch[1];
        const shortBase = `https://www.mercadolivre.com.br/p/${productId}`;
        return env.mlAffiliateTag ? `${shortBase}?matt_tool=${env.mlAffiliateTag}` : shortBase;
    }
    return link;
  }

  async generateRawMessage(product) {
    const link = await this.formatLink(product.link);
    return `Imagem: ${product.imageUrl}\nTítulo: ${product.title}\nDescrição: ${product.description}\nValor: R$ ${product.price.toFixed(2)}\nLink: ${link}`;
  }

  // Títulos criativos que variam a cada postagem
  getCreativeTitle(hasDiscount) {
    if (hasDiscount) {
      const titles = [
        '🚨 *OFERTA RELÂMPAGO MERCADO LIVRE*',
        '🔥 *PROMOÇÃO IMPERDÍVEL - CORRE!*',
        '💥 *ACHADO DO DIA - MERCADO LIVRE*',
        '⚡ *PREÇO DE LIQUIDAÇÃO!*',
        '🤑 *DESCONTO ABSURDO - SÓ HOJE!*',
        '💰 *MEGA OFERTA MERCADO LIVRE*',
        '🏪 *QUEIMA DE PREÇO - MERCADO LIVRE*',
      ];
      return titles[Math.floor(Math.random() * titles.length)];
    } else {
      const titles = [
        '🏷️ *OFERTAÇO DO DIA - APROVEITE!*',
        '🎯 *OFERTA ESPECIAL PRA VOCÊ!*',
        '🛒 *CORRE QUE TÁ BARATO!*',
        '🔔 *ALERTA DE PROMOÇÃO!*',
        '💎 *ACHADO IMPERDÍVEL!*',
        '✨ *MELHOR PREÇO DO MERCADO LIVRE!*',
        '🏠 *OFERTA PRA SUA CASA!*',
      ];
      return titles[Math.floor(Math.random() * titles.length)];
    }
  }

  // Frases de urgência variadas
  getUrgencyPhrase() {
    const phrases = [
      '⏰ *PISCOU, PERDEU! APROVEITEM!!*',
      '⏳ *CORRE QUE ACABA RÁPIDO!*',
      '🏃 *VAI ACABAR! GARANTA O SEU!*',
      '⚡ *ÚLTIMAS UNIDADES NESSE PREÇO!*',
      '🔥 *NÃO PERCA ESSA CHANCE!*',
      '💨 *VOANDO DO ESTOQUE!*',
      '🚀 *PREÇO PODE SUBIR A QUALQUER MOMENTO!*',
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  async generateFormattedMessage(product) {
    const finalLink = await this.formatLink(product.link);
    const currentPrice = product.price;
    const oldPrice = product.oldPrice || (currentPrice * 1.2); // Simula um preço antigo se não houver
    
    // Lista de Chamadas de Cupom Variadas
    const alerts = [
      'CORREEE E PEGA SEU CUPOM 😱',
      'ALERTA DE PREÇO BAIXO 🚨',
      'ACABOU DE BAIXAR! 📉🔥',
      'OFERTA COM CUPOM ATIVO 🎫',
      'MENOR PREÇO DOS ÚLTIMOS DIAS 💰'
    ];
    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];

    // Simulação de cupom (Se o produto tiver, ele usa, senão usa um genérico de categoria ou instrução)
    const coupon = product.coupon || 'OFERTAOFF';

    const message = [
      `*${randomAlert}*`,
      '',
      `${product.title}`,
      '',
      `De: ~R$ ${oldPrice.toFixed(2).replace('.', ',')}~`,
      `*POR: R$ ${currentPrice.toFixed(2).replace('.', ',')} ✅*`,
      '',
      `🎟️ Use o cupom:  *${coupon}*`,
      '',
      `🛒 Compre aqui: ${finalLink}`
    ].join('\n');

    return message;
  }
}

module.exports = new FormatterService();
