const env = require('../config/env');
const axios = require('axios');
const logger = require('../config/logger');

class FormatterService {
  async formatLink(link) {
    if (!link) return '';
    
    // 1. Tenta encurtador is.gd
    try {
        const res = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(link)}`, { timeout: 3000 });
        if (res.data && res.data.includes('http')) return res.data;
    } catch (e) {}

    // 2. Tenta encurtador TinyURL
    try {
        const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(link)}`, { timeout: 3000 });
        if (res.data && res.data.includes('http')) return res.data;
    } catch (e) {}

    // 3. Fallback: Limpeza Manual Agressiva (Remove TUDO exceto o id e o matt_tool)
    const mlbMatch = link.match(/(MLB[U]?\d+)/i);
    if (mlbMatch) {
        const id = mlbMatch[1];
        const tag = env.mlAffiliateTag || '';
        return `https://mercadolivre.com.br/p/${id}?matt_tool=${tag}`;
    }
    
    return link.split('?')[0]; // Remove query strings lixo
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
      'Gente, olha esse achadinho! 😱🔥',
      'Pára tudo e olha esse preço! 😍✨',
      'Achei e precisei mostrar pra vocês! 🤩',
      'Aquele precinho que a gente ama! 🤑',
      'Dica de ouro pra vcs hoje! ✨🛍️',
      'Socorro, olha esse desconto! 🔥🚨',
      'Corre que esse tá valendo muito! 🏃💨',
      'Duvido você achar mais barato! 💸✨',
      'Um luxo pra sua casa com esse preço! 🏠💖',
      'Cata essa oferta que acabou de sair! 🔔🔥'
    ];
    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];

    return [
      `*${randomAlert}*`,
      ``,
      `${product.title}`,
      ``,
      `De: ~R$ ${oldPrice.toFixed(2).replace('.', ',')}~`,
      `*POR: R$ ${currentPrice.toFixed(2).replace('.', ',')} ✅*`,
      ``,
      `🎟️ Use o cupom: *${coupon}*`,
      ``,
      `🛒 Compre aqui: ${finalLink}`
    ].join('\n');
  }
}

module.exports = new FormatterService();
