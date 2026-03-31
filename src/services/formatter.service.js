const env = require('../config/env');
const axios = require('axios');
const logger = require('../config/logger');

class FormatterService {
  formatLink(link) {
      if (!env.mlAffiliateTag) return link;
      const separator = link.includes('?') ? '&' : '?';
      return `${link}${separator}is_affiliate=true&tag=${env.mlAffiliateTag}`;
  }

  async generateRawMessage(product) {
    const link = this.formatLink(product.link);
    return `Imagem: ${product.imageUrl}\nTítulo: ${product.title}\nDescrição: ${product.description}\nValor: R$ ${product.price.toFixed(2)}\nLink: ${link}`;
  }

  async generateFormattedMessage(product) {
    const mlLink = this.formatLink(product.link);
    let finalLink = mlLink;

    try {
        // Encurtador seguro para links de afiliados
        const response = await axios.get(`https://is.gd/create.php?format=json&url=${encodeURIComponent(mlLink)}`);
        if (response.data && response.data.shorturl) {
            finalLink = response.data.shorturl;
        }
    } catch(err) {
        logger.warn('Falha ao encurtar o link com is.gd. Mantendo link do ML.', err.message);
    }

    return `🔥 *OFERTA DO DIA* 🔥\n\n📦 *${product.title}*\n\n💰 *Por Apenas:* R$ ${product.price.toFixed(2)}\n\n🛒 *Compre aqui:* ${finalLink}`;
  }
}

module.exports = new FormatterService();
