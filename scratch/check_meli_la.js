const axios = require('axios');

async function checkMeliLa() {
    const url = 'https://www.mercadolivre.com.br/air-fryer-gaabor-af-65m02a-negro-220v/p/MLB25026903';
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });
        console.log('--- HTML CHECK ---');
        console.log('Includes meli.la:', data.includes('meli.la'));
        const matches = data.match(/https?:\/\/meli\.la\/[a-zA-Z0-9]+/g);
        console.log('Matches:', matches);
    } catch (e) {
        console.error(e.message);
    }
}

checkMeliLa();
