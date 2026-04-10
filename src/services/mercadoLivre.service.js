const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../config/logger');

const searchProducts = async (searchTerm) => {
    logger.info(`🔍 Buscando produtos no Mercado Livre para: ${searchTerm}...`);
    
    try {
        const url = `https://lista.mercadolivre.com.br/${encodeURIComponent(searchTerm)}`;
        
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Referer': 'https://www.google.com/'
            },
            timeout: 15000
        });

        // Verificação expandida de bloqueio
        if (html.includes('id="captcha"') || html.includes('g-recaptcha') || html.includes('Forbidden') || html.includes('Aviso de segurança')) {
            logger.warn(`⚠️ Bloqueio ou Captcha detectado no Scraper para "${searchTerm}". Tentando API fallback...`);
            return await fetchFromBackupAPI(searchTerm);
        }

        const $ = cheerio.load(html);
        const products = [];

        // Função auxiliar para extrair ID estável
        const getStableId = (link, title) => {
            const mlbMatch = link.match(/MLB-?(\d+)/i);
            if (mlbMatch) return `MLB${mlbMatch[1]}`;
            // Se não tiver MLB no link, cria um hash curto baseado no título
            const hash = Buffer.from(title || link).toString('base64').substring(0, 8).replace(/[^a-zA-Z0-9]/g, 'x');
            return `MLH-${hash}`;
        };

        // Seletor 1: Layout Grid (Poly)
        $('.poly-card__content').each((i, element) => {
            if (products.length >= 10) return false;
            try {
                const title = $(element).find('.poly-component__title').text().trim() || $(element).find('h2').text().trim();
                const priceFrac = $(element).find('.andes-money-amount__fraction').first().text().replace(/\D/g, '');
                const priceCents = $(element).find('.andes-money-amount__cents').first().text() || '00';
                const price = parseFloat(`${priceFrac}.${priceCents}`);
                
                const link = $(element).find('a').first().attr('href');
                const image = $(element).closest('.poly-card').find('img').attr('data-src') || 
                              $(element).closest('.poly-card').find('img').attr('src');

                if (title && price && link) {
                    products.push({
                        id: getStableId(link, title),
                        title,
                        price,
                        link,
                        imageUrl: image,
                        description: `Oferta encontrada: ${searchTerm}`
                    });
                }
            } catch (err) { }
        });

        // Seletor 2: Layout Lista (Tradicional) se o primeiro falhar
        if (products.length === 0) {
            $('.ui-search-result__content-wrapper').each((i, element) => {
                if (products.length >= 10) return false;
                try {
                    const title = $(element).find('.ui-search-item__title').text().trim();
                    const priceFrac = $(element).find('.andes-money-amount__fraction').first().text().replace(/\D/g, '');
                    const priceCents = $(element).find('.andes-money-amount__cents').first().text() || '00';
                    const price = parseFloat(`${priceFrac}.${priceCents}`);
                    const link = $(element).find('a.ui-search-link').attr('href') || $(element).find('a').attr('href');
                    const image = $(element).closest('.ui-search-result').find('img').attr('data-src') || 
                                  $(element).closest('.ui-search-result').find('img').attr('src');

                    if (title && price && link) {
                        products.push({
                            id: getStableId(link, title),
                            title,
                            price,
                            link,
                            imageUrl: image,
                            description: `Oferta lista: ${searchTerm}`
                        });
                    }
                } catch (err) {}
            });
        }

        if (products.length === 0) {
            logger.info(`ℹ️ Scraper não encontrou produtos para "${searchTerm}". Indo para API backup...`);
            return await fetchFromBackupAPI(searchTerm);
        }

        logger.info(`✅ Encontrados ${products.length} produtos via Scraper para "${searchTerm}".`);
        return products;
        
    } catch (error) {
        logger.error(`❌ Erro no Scraper (${searchTerm}): ${error.message}`);
        return await fetchFromBackupAPI(searchTerm);
    }
};

const fetchFromBackupAPI = async (searchTerm) => {
    try {
        logger.info(`🔌 Tentando API oficial (Backup) para: ${searchTerm}...`);
        const apiUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(searchTerm)}&limit=10`;
        
        const { data } = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            },
            timeout: 10000
        });
        
        if (!data.results || data.results.length === 0) {
            logger.warn(`⚠️ API não retornou resultados para "${searchTerm}".`);
            return [];
        }

        const results = data.results.map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            link: p.permalink,
            imageUrl: p.thumbnail?.replace('-I.jpg', '-O.jpg'), // Melhora qualidade da imagem
            description: 'Oferta (via API)'
        }));
        
        logger.info(`✅ API retornou ${results.length} produtos para "${searchTerm}".`);
        return results;
    } catch (apiErr) {
        const detail = apiErr.response ? `Status ${apiErr.response.status}` : 'Erro Conexão';
        logger.error(`❌ Falha total na API para "${searchTerm}" (${detail}): ${apiErr.message}`);
        return [];
    }
};

module.exports = {
  searchProducts
};
