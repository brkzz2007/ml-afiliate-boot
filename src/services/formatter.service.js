const env = require('../config/env');
const axios = require('axios');
const logger = require('../config/logger');

class FormatterService {
  async formatLink(link) {
    if (!link) return '';

    const tag = env.mlAffiliateTag || 'bv20260330080614';
    
    // Limpa o link de parâmetros originais e anexa a tag
    const baseLink = link.split('?')[0].split('#')[0];
    const finalLink = `${baseLink}?matt_tool=${tag}`;

    // 🔗 Tenta encurtar para deixar o link pequeno e bonito
    try {
      const res = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(finalLink)}`, { timeout: 4000 });
      if (res.data && res.data.includes('http')) {
        return res.data.trim();
      }
    } catch (e) {
      logger.debug(`Falha ao encurtar com is.gd: ${e.message}`);
    }

    // Fallback: Tenta com TinyURL caso o is.gd falhe
    try {
      const resTiny = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(finalLink)}`, { timeout: 4000 });
      if (resTiny.data && resTiny.data.includes('http')) {
        return resTiny.data.trim();
      }
    } catch (e) {
      logger.debug(`Falha ao encurtar com tinyurl: ${e.message}`);
    }

    return finalLink;
  }

  async generateRawMessage(product) {
    const link = await this.formatLink(product.link);
    return `Imagem: ${product.imageUrl}\nTítulo: ${product.title}\nValor: R$ ${product.price.toFixed(2)}\nLink: ${link}`;
  }

  async generateFormattedMessage(product) {
    const finalLink = await this.formatLink(product.link);
    const currentPrice = product.price;
    const oldPrice = product.oldPrice || (currentPrice * 1.15);
    
    // Deixa o título mais curto e direto se for muito longo (ajuda na elegância)
    let elegantTitle = product.title;
    if (elegantTitle.length > 70) {
      elegantTitle = elegantTitle.substring(0, 70) + '...';
    }

    const alerts = [
      '✨ OPORTUNIDADE IMPERDÍVEL PARA SEU LAR! 👇',
      '🏠 DEIXE SUA CASA AINDA MAIS INCRÍVEL! ✨',
      '💎 DICA PREMIUM DE HOJE PRA VOCÊ ECONOMIZAR:',
      '🚨 ALERTA DE PREÇO DE BLACK FRIDAY!',
      '😍 SUA CASA MERECE ESSE MIMO (E seu bolso agradece):',
      '⚡ PROMOÇÃO RELÂMPAGO: ACABOU DE BAIXAR! 👇',
      '🥇 SÓ PRODUTO TOP COM DESCONTO REAL:',
      '🏃‍♀️ CORRE QUE ESSE ESTOQUE VAI ZERAR RÁPIDO!',
      '💖 LUXO E PRATICIDADE ACESSÍVEL PARA VOCÊ:',
      '🔥 PREÇO SURREAL! Melhor oferta do dia:'
    ];
    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];

    return [
      `*${randomAlert}*`,
      ``,
      `🛍️ *${elegantTitle}*`,
      ``,
      `❌ ~De: R$ ${oldPrice.toFixed(2).replace('.', ',')}~`,
      `✅ *POR APENAS: R$ ${currentPrice.toFixed(2).replace('.', ',')}* 😱`,
      ``,
      `🛒 *Acesse a oferta e garanta o seu aqui:*`,
      `👉 ${finalLink}`
    ].join('\n');
  }
}

module.exports = new FormatterService();
