const env = require('../config/env');
const axios = require('axios');
const logger = require('../config/logger');

class FormatterService {
  formatLink(link) {
      if (!link) return '';
      
      // Limpa a URL original tirando rastreios de outros usuários/vendedores
      let cleanLink = link.split('?')[0];
      if (cleanLink.includes('#')) cleanLink = cleanLink.split('#')[0];

      if (!env.mlAffiliateTag) return cleanLink;

      // Adiciona a tag de forma limpa
      // Nota: Para links oficiais de afiliado, o ideal seria usar a API do ML ou o portal.
      // Aqui estamos seguindo o padrão configurado no projeto para "deep linking" simplificado.
      const finalLink = `${cleanLink}?matt_tool=${env.mlAffiliateTag}&utm_source=whatsapp&utm_medium=chatbot&utm_campaign=afiliados_bot`;
      
      logger.debug(`🔗 Link gerado: ${finalLink}`);
      return finalLink;
  }

  async generateRawMessage(product) {
    const link = this.formatLink(product.link);
    return `Imagem: ${product.imageUrl}\nTítulo: ${product.title}\nDescrição: ${product.description}\nValor: R$ ${product.price.toFixed(2)}\nLink: ${link}`;
  }

  async generateFormattedMessage(product) {
    const mlLink = this.formatLink(product.link);
    let finalLink = mlLink;

    try {
        const response = await axios.get(`https://is.gd/create.php?format=json&url=${encodeURIComponent(mlLink)}`);
        if (response.data && response.data.shorturl) {
            finalLink = response.data.shorturl;
        }
    } catch(err) {
        logger.warn('Falha ao encurtar o link com is.gd. Mantendo link do ML.', err.message);
    }

    const currentPrice = product.price;
    const originalPrice = product.oldPrice || (currentPrice * 1.15); // Fallback visual de 15%
    
    // Cálculo do desconto real
    let discountPercent = 0;
    if (product.oldPrice && product.oldPrice > currentPrice) {
        discountPercent = Math.round(((product.oldPrice - currentPrice) / product.oldPrice) * 100);
    } else {
        discountPercent = Math.floor(Math.random() * (25 - 10 + 1)) + 10; // Fallback entre 10% e 25%
    }

    return `🚨 *OFERTA RELÂMPAGO MERCADO LIVRE*\n\n*${product.title}*\n\n✖️ De: R$ ${originalPrice.toFixed(2)}\n🤑 Por: R$ ${currentPrice.toFixed(2)} 😱🔥 ${discountPercent}% OFF\n\n🏷️ CUPOM: *VALECUPOM*\n\n🚛 *FRETE GRÁTIS*\n\n⏰ *PISCOU, PERDEU! APROVEITEM!!*\n\n🔗🛒👇\n${finalLink}`;
  }
}

module.exports = new FormatterService();
