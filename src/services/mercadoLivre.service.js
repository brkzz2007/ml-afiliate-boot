const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../config/logger');

const searchProducts = async (searchTerm) => {
    logger.info(`🔍 Buscando produtos no Mercado Livre para: ${searchTerm}...`);
    
    try {
        // Tenta usar a URL de busca direta que costuma ser menos bloqueada
        const url = `https://lista.mercadolivre.com.br/${encodeURIComponent(searchTerm)}`;
        
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 10000
        });

        const $ = cheerio.load(html);
        const products = [];

        // Detecção de captcha ou bloqueio
        if (html.includes('id="captcha"') || html.includes('g-recaptcha') || html.length < 5000) {
            logger.warn(`⚠️  Scraper detectou Captcha ou bloqueio para '${searchTerm}'.`);
        } else {
            const itemSelectors = [
                '.ui-search-result__wrapper', 
                '.ui-search-layout__item', 
                '.ui-search-result',
                'li.ui-search-layout__item'
            ];
            
            for (const selector of itemSelectors) {
                $(selector).each((i, element) => {
                    if (products.length >= 10) return false;

                    try {
                        const title = $(element).find('.ui-search-item__title').text().trim();
                        // Preço pode estar em diferentes formatos
                        let priceText = $(element).find('.andes-money-amount__fraction').first().text().replace(/\./g, '');
                        if (!priceText) priceText = $(element).find('.ui-search-price__part--number').text().replace(/\./g, '');
                        
                        const priceCents = $(element).find('.andes-money-amount__cents').first().text() || '00';
                        const price = parseFloat(`${priceText}.${priceCents}`);
                        
                        const link = $(element).find('a.ui-search-link').attr('href') || $(element).find('a').first().attr('href');
                        const image = $(element).find('img.ui-search-result-image__element').attr('data-src') || 
                                    $(element).find('img.ui-search-result-image__element').attr('src') ||
                                    $(element).find('img').first().attr('src');

                        if (title && price && link && link.includes('mercadolivre.com.br')) {
                            products.push({
                                id: link.split('/MLB-')[1]?.split('-')[0] || `ML-${Math.random().toString(36).substr(2, 9)}`,
                                title,
                                price,
                                link,
                                imageUrl: image,
                                description: `Oferta: ${searchTerm}`
                            });
                        }
                    } catch (err) { }
                });
                if (products.length > 0) break;
            }
        }

        if (products.length === 0) {
            logger.warn(`⚠️  Scraper falhou para '${searchTerm}'. Tentando API de Backup...`);
            return await fetchFromBackupAPI(searchTerm);
        }

        logger.info(`✅ Encontrados ${products.length} produtos via Web Scraper.`);
        return products;
        
    } catch (error) {
        logger.error(`❌ Erro no Scraper do ML: ${error.message}`);
        return await fetchFromBackupAPI(searchTerm);
    }
};

const fetchFromBackupAPI = async (searchTerm) => {
    try {
        logger.info(`🔌 Buscando via API de Backup para: ${searchTerm}...`);
        const apiUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(searchTerm)}&limit=10`;
        
        // Adiciona headers simples na API também, às vezes ajuda
        const { data } = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            },
            timeout: 8000
        });
        
        const results = data.results.map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            link: p.permalink,
            imageUrl: p.thumbnail,
            description: 'Oferta (via API)'
        }));
        
        logger.info(`✅ API retornou ${results.length} produtos.`);
        return results;
    } catch (apiErr) {
        logger.error(`❌ Backup API também falhou: ${apiErr.message}`);
        return [];
    }
};

module.exports = {
  searchProducts
};
