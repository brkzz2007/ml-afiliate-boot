const { db } = require('../src/database/init');
const logger = require('../src/config/logger');

// Copied from src/services/mercadoLivre.service.js
const PRODUCT_BLACKLIST = [
    'martelete', 'parafusadeira', 'furadeira', 'ferramenta', 'pneu', 'pc gamer', 
    'oficina', 'mecanico', 'gamer', 'brinquedo', 'peca de carro', 'moto', 'bivolt',
    'chave de fenda', 'serra', 'trena', 'multimetro', 'politriz', 'esmerilhadeira',
    'carro', 'automotivo', 'veículo', 'capacete', 'retrovisor', 'farol', 'calota',
    'volante', 'protetor solar para carro', 'limpador de parabrisa', 'óleo de motor',
    'bateria de carro', 'som automotivo', 'central multimídia', 'tapete de carro',
    'capa de banco', 'suporte celular carro', 'transmissor fm', 'carregador veicular'
];

async function cleanupBlacklisted() {
    console.log('🧹 Iniciando limpeza de produtos indesejados da fila...');
    try {
        // Busca todos os itens aprovados
        const querySelect = `
            SELECT q.id, p.title 
            FROM queue q 
            JOIN products p ON q.product_id = p.id 
            WHERE q.status = 'approved'
        `;
        const items = await db.all(querySelect, []);
        
        let removedCount = 0;
        for (const item of items) {
            const shouldRemove = PRODUCT_BLACKLIST.some(word => 
                item.title.toLowerCase().includes(word.toLowerCase())
            );
            
            if (shouldRemove) {
                console.log(`❌ Removendo: ${item.title}`);
                await db.run('DELETE FROM queue WHERE id = ?', [item.id]);
                removedCount++;
            }
        }
        
        console.log(`✅ Limpeza concluída! ${removedCount} itens removidos.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Erro na limpeza:', err);
        process.exit(1);
    }
}

cleanupBlacklisted();
