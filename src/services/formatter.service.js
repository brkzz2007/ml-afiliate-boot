const env = require('../config/env');
const axios = require('axios');
const logger = require('../config/logger');

class FormatterService {
  async formatLink(link) {
    if (!link) return '';

    const tag = env.mlAffiliateTag || 'bv20260330080614';
    
    let finalLink = '';
    const mlbMatch = link.match(/(MLB[U]?\d+)/i);
    
    if (mlbMatch) {
      const id = mlbMatch[1];
      finalLink = `https://www.mercadolivre.com.br/p/${id}?matt_tool=${tag}`;
    } else {
      const baseLink = link.split('?')[0];
      finalLink = `${baseLink}?matt_tool=${tag}`;
    }

    // 🔗 Tenta encurtar para deixar o link pequeno
    try {
      const res = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(finalLink)}`, { timeout: 4000 });
      if (res.data && res.data.includes('http')) {
        return res.data;
      }
    } catch (e) {
      logger.debug(`Falha ao encurtar link: ${e.message}`);
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
    const coupon = product.coupon || 'OFERTAOFF';

    const alerts = [
      'Gente, olha esse achado 😱🔥 barato demais!',
      'Para tudo e vê esse preço 😍✨ surreal!',
      'Achei isso e tive que trazer pra vocês 🤩',
      'Esse precinho tá irresistível 🤑🔥',
      'Dica de ouro de hoje pra casa ✨🛍️',
      'Socorro, olha esse desconto 🚨🔥 bom demais!',
      'Corre que esse vale MUITO a pena 🏃💨',
      'Sério… difícil achar mais barato que isso 💸✨',
      'Luxo pra sua casa sem gastar muito 🏠💖',
      'Olha essa oferta que acabou de sair 🔔🔥',
      'Promoção boa de verdade, confere 👇🔥',
      'Achado do dia pra sua casa 🏠✨',
      'Esse aqui vale cada centavo 💸🔥',
      'Oferta que compensa demais hoje 🛍️',
      'Preço baixo + qualidade boa 👀🔥',
      'ESSE PREÇO TÁ BRABO 😱🔥',
      'Barato demais pra deixar passar 🚨',
      'Olha isso aqui antes que acabe 👀🔥',
      'Não sei como ainda não esgotou 😳',
      'Isso aqui tá fora do normal 💥',
      'Pode confiar, esse vale a pena 👍🔥',
      'Testado e aprovado, ótimo custo-benefício 💯',
      'Pra quem quer economizar de verdade 💸',
      'Ótima opção pra casa, preço justo 👌',
      'Esse aqui eu recomendo sem medo 🔥',
      'Sua casa mais completa sem gastar muito 🏠✨',
      'Item útil e barato pra casa 👇🔥',
      'Coisa boa pra casa com preço baixo 💖',
      'Pra facilitar seu dia a dia em casa 🛒',
      'Essencial pra casa com desconto top 🔥',
      'Corre antes que suba o preço ⏳🔥',
      'Últimas unidades nesse valor 🚨',
      'Aproveita agora porque tá compensando 💸',
      'Esse aqui não dura muito 👀',
      'Se piscar, perde essa 😅🔥'
    ];
    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];

    return [
      `🚨 *${randomAlert}*`,
      ``,
      `*${product.title}*`,
      ``,
      `❌ De: ~R$ ${oldPrice.toFixed(2).replace('.', ',')}~`,
      `✅ *POR: R$ ${currentPrice.toFixed(2).replace('.', ',')}*`,
      ``,
      `🛒 *COMPRAR:* ${finalLink}`
    ].join('\n');
  }
}

module.exports = new FormatterService();
