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

  async generateFormattedMessage(product) {
    const finalLink = await this.formatLink(product.link);
    const currentPrice = product.price;
    const oldPrice = product.oldPrice || (currentPrice * 1.15);
    const coupon = product.coupon || 'OFERTAOFF';

    return [
      `*CORREEE E PEGA SEU CUPOM 😱*`,
      ``,
      `${product.title}`,
      ``,
      `De: ~R$ ${oldPrice.toFixed(2).replace('.', ',')}~`,
      `*POOR: R$ ${currentPrice.toFixed(2).replace('.', ',')} ✅*`,
      ``,
      `🎟️ Use o cupom: *${coupon}*`,
      ``,
      `🛒 Compre aqui: ${finalLink}`
    ].join('\n');
  }
}

module.exports = new FormatterService();
