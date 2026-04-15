const repository = require('../src/database/repository');
const { initializeDB } = require('../src/database/init');
const logger = require('../src/config/logger');

async function run() {
    try {
        await initializeDB();
        logger.info('Limpando banco de dados para o novo nicho...');
        await repository.clearQueue();
        logger.info('Banco de dados limpo com sucesso!');
        process.exit(0);
    } catch (err) {
        logger.error('Erro ao limpar banco:', err);
        process.exit(1);
    }
}

run();
