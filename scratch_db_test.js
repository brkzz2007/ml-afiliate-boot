const { initializeDB } = require('./src/database/init');
const repository = require('./src/database/repository');

async function test() {
    try {
        await initializeDB();
        const product = {
            id: 'TEST' + Date.now(),
            title: 'Produto Teste',
            price: 99.90,
            link: 'https://test.com',
            imageUrl: 'https://test.com/img.jpg',
            description: 'Descricao'
        };
        console.log('Salvando produto...');
        await repository.saveProduct(product);
        console.log('Produto salvo com sucesso!');
        
        console.log('Enfileirando...');
        await repository.enqueueProduct({
            productId: product.id,
            rawMessage: 'raw',
            formattedMessage: 'formatted'
        });
        console.log('Enfileirado com sucesso!');
    } catch (err) {
        console.error('ERRO NO TESTE:', err);
    }
}

test();
