const env = require('../config/env');
const axios = require('axios');
const logger = require('../config/logger');

class FormatterService {
  formatLink(link) {
      if (!link) return '';
      
      // Tenta extrair o ID MLB (Ex: MLB44160351)
      const mlbMatch = link.match(/(MLB[U]?\d+)/i);
      if (mlbMatch) {
          const productId = mlbMatch[1];
          // Formato oficial mais curto possível: mercadolivre.com.br/p/MLB...
          const shortBase = `https://www.mercadolivre.com.br/p/${productId}`;
          
          if (env.mlAffiliateTag) {
              return `${shortBase}?matt_tool=${env.mlAffiliateTag}`;
          }
          return shortBase;
      }

      // Fallback caso não ache o ID
      let cleanLink = link.split('?')[0];
      if (env.mlAffiliateTag) return `${cleanLink}?matt_tool=${env.mlAffiliateTag}`;
      return cleanLink;
  }

  async generateRawMessage(product) {
    const link = this.formatLink(product.link);
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
    const finalLink = this.formatLink(product.link);
    const currentPrice = product.price;

    const phrases = [
      'Gente, olha esse achadinho! 😱🔥',
      'Págra tudo e olha esse preço! 😍🔥',
      'Aquele precinho que a gente ama! 🤑✨',
      'Dica de ouro pra vocês hoje! 💎🛍️',
      'Achei e precisei compartilhar! 🤩🔥',
      'Corre que esse tá valendo muito! 🏃💨',
      'Duvido você achar mais barato! 💸✨',
      'Um luxo pra sua casa com esse preço! 🏠💖',
      'Estoque deve acabar rápido, aproveitem! ⏳🔥'
    ];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    // Detector de cupons (Simulado se não houver no objeto, mas pronto para receber)
    const couponLine = product.coupon ? `\n🎟️ Cupom: *${product.coupon}*\n` : '\n🎟️ Verifique se há cupons na página!\n';

    return `${randomPhrase}\n\n🛍️ *${product.title}*\n${couponLine}\n💰 R$ ${currentPrice.toFixed(2).replace('.', ',')} 😱🔥\n\n🛒 Compre aqui: ${finalLink}`;
  }
}

module.exports = new FormatterService();
