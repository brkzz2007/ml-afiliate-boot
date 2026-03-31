const axios = require('axios');
const logger = require('../config/logger');
const { withRetry } = require('../utils/retry');

const BASE_URL = 'https://api.mercadolibre.com';

class MercadoLivreService {
  async searchProducts(keyword, category = '') {
    logger.info(`Buscando produtos no ML. Keyword: ${keyword}`);
    
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    };

    const fn = async () => {
      try {
        // Busca na API pública focando em ofertas e descontos do dia
        const searchUrl = `${BASE_URL}/sites/MLB/search?q=promoção&sort=relevance&condition=new&limit=15`;
        logger.info('Buscando promoções diárias...');
        const response = await axios.get(searchUrl, { headers });
        
        if (response.data && response.data.results) {
            return response.data.results;
        }
        return response.data;
      } catch (err) {
            logger.warn('API de Busca falhou. Usando produtos de fallback...');
            return [
                { id: 'MLB3521401254', title: 'Smartphone Samsung Galaxy S23 5G 256GB - OFERTA', price: 3499, thumbnail: 'https://http2.mlstatic.com/D_NQ_NP_918514-MLU74378939281_022024-O.webp' },
                { id: 'MLB3321401255', title: 'Xiaomi Redmi Note 13 4G 128GB - OFERTA', price: 1099, thumbnail: 'https://http2.mlstatic.com/D_NQ_NP_994640-MLA74003362148_012024-O.webp' }
            ];
      }
    };

    const results = await withRetry(fn);
    if (!results) return [];
    return results.map(p => this.normalizeProduct(p));
  }

  normalizeProduct(raw) {
    if (!raw) return null;
    const shortLink = `https://produto.mercadolivre.com.br/${raw.id}`;
    return {
      id: raw.id,
      title: raw.title,
      price: raw.price,
      link: shortLink,
      imageUrl: raw.thumbnail ? raw.thumbnail.replace('-I.jpg', '-O.jpg') : '',
      description: raw.title,
    };
  }
}

module.exports = new MercadoLivreService();
