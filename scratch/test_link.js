const formatter = require('../src/services/formatter.service');
const env = require('../src/config/env');

async function verify() {
    console.log('--- VERIFICAÇÃO DE LINKS DE AFILIADO ---');
    console.log(`Tag configurada: ${env.mlAffiliateTag}`);

    const sampleProduct = {
        title: 'Produto Teste',
        price: 100.0,
        oldPrice: 150.0,
        link: 'https://produto.mercadolivre.com.br/MLB-123456-monitor-gamer-24-full-hd-144hz-_JM?searchVariation=1234#position=1&search_layout=grid',
        imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_919192-MLB123456-F.webp'
    };

    console.log('\n1. Verificando Limpeza e Formatação de Link:');
    const formattedLink = formatter.formatLink(sampleProduct.link);
    console.log(`Original: ${sampleProduct.link}`);
    console.log(`Formatado: ${formattedLink}`);

    console.log('\n2. Verificando Mensagem Completa:');
    const message = await formatter.generateFormattedMessage(sampleProduct);
    console.log('--- MENSAGEM GERADA ---');
    console.log(message);
    console.log('-----------------------');

    if (formattedLink.includes('matt_tool=') && formattedLink.includes(env.mlAffiliateTag)) {
        console.log('\n✅ SUCESSO: Tag de afiliado encontrada no link!');
    } else {
        console.log('\n❌ ERRO: Tag de afiliado NÃO encontrada no link!');
    }
}

verify();
