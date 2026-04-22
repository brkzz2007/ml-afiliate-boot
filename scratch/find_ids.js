const axios = require('axios');
const cheerio = require('cheerio');

async function dumpProductData() {
    const url = 'https://www.mercadolivre.com.br/air-fryer-gaabor-af-65m02a-negro-220v/p/MLB25026903';
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });
        
        // Procure por qualquer ID de 8-12 caracteres em maiúsculas com hifen
        const regex = /[A-Z0-9]{5,8}-[A-Z0-9]{4}/g;
        const matches = data.match(regex);
        console.log('Possible IDs:', matches);
        
        const $ = cheerio.load(data);
        const scripts = $('script');
        scripts.each((i, s) => {
            const content = $(s).html();
            if (content.includes('short_url') || content.includes('id_produto')) {
                console.log('Found suspicious script!');
            }
        });
    } catch (e) {
        console.error(e.message);
    }
}

dumpProductData();
