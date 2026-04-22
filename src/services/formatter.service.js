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
    
    // Extrai o ID MLB para o "Busca Rápida"
    const mlbMatch = product.link.match(/(MLB[U]?\d+)/i);
    const mlbId = mlbMatch ? mlbMatch[1] : '';

    const alerts = [
      'Item útil e barato pra casa 👇🔥',
      'Olha esse achado pra sua casa 🏠✨',
      'Dica de ouro de hoje pra economizar 💸🔥',
      'Achado do dia com preço de Black Friday 🚨',
      'Sua casa merece esse mimo (e seu bolso agradece) 😍',
      'Promoção boa de verdade, confere embaixo 👇🔥',
      'Esse aqui vale cada centavo, qualidade garantida 💯',
      'Corre que esse desconto tá surreal hoje 🏃💨',
      'Luxo acessível para o seu lar 🏠💖',
      'Não sei como ainda não esgotou nesse preço 😳🔥'
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
      `🔍 *Cole este texto no buscador do Mercado Livre:*`,
      `${mlbId}`,
      ``,
      `🔗 *Ou acesse o link:*`,
      `${finalLink}`
    ].join('\n');
  }
}

module.exports = new FormatterService();
