const env = require('../config/env');

class FormatterService {
  formatLink(link) {
      if (!env.mlAffiliateTag) return link;
      const separator = link.includes('?') ? '&' : '?';
      return `${link}${separator}is_affiliate=true&tag=${env.mlAffiliateTag}`;
  }

  generateRawMessage(product) {
    const link = this.formatLink(product.link);
    return `Imagem: ${product.imageUrl}\nTítulo: ${product.title}\nDescrição: ${product.description}\nValor: R$ ${product.price.toFixed(2)}\nLink: ${link}`;
  }

  generateFormattedMessage(product) {
    const link = this.formatLink(product.link);
    return `🖼 ${product.imageUrl}\n📦 *${product.title}*\n📝 ${product.description}\n💰 R$ ${product.price.toFixed(2)}\n🔗 ${link}`;
  }
}

module.exports = new FormatterService();
