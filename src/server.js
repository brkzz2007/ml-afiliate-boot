const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');

// Capturar erros globais para evitar que o Render derrube o serviço em timeouts
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const { initializeDB } = require('./database/init');
const { startCaptureJob } = require('./jobs/capture.job');
const { startPublishJob } = require('./jobs/publisher.job');
const { startCleanupJob, cleanupTask } = require('./jobs/cleanup.job');

const startServer = async () => {
    logger.info('Iniciando o processo de boot do servidor...');
    
    // 1. Iniciar servidor web IMEDIATAMENTE (Passo crucial para o Render)
    let serverInstance;
    try {
        serverInstance = app.listen(env.port, '0.0.0.0', () => {
            logger.info(`🚀 Servidor pronto na porta ${env.port}. Motor: ${env.nodeEnv}`);
        });
    } catch (e) {
        logger.error('❌ Não foi possível iniciar o servidor web:', e.message);
        process.exit(1);
    }

    try {
        // 2. Inicializar o banco de dados (Assíncrono)
        logger.info('Tentando inicializar banco de dados...');
        await initializeDB();
        logger.info('✅ Banco de Dados Pronto.');

        // 3. Iniciar o Motor do WhatsApp (Baileys)
        logger.info('Carregando Motor do WhatsApp...');
        const whatsappPublisher = require('./publishers/whatsapp.publisher');
        whatsappPublisher.initialize().catch(err => {
            logger.error('⚠️ Falha parcial na inicialização do Baileys:', err.message);
        });
        
        // 4. Iniciar Cron Jobs
        const { startCaptureJob } = require('./jobs/capture.job');
        const { startPublishJob } = require('./jobs/publisher.job');
        const { startCleanupJob, cleanupTask } = require('./jobs/cleanup.job');

        startCleanupJob();
        startCaptureJob();
        startPublishJob();

        // Limpeza inicial assíncrona
        cleanupTask().catch(e => logger.error('Erro na limpeza inicial:', e));

    } catch (error) {
        logger.error('⚠️ Falha durante o boot, mas o servidor segue vivo:', error.message);
    }
};

// Captura qualquer erro não tratado para mostrar no log
process.on('uncaughtException', (err) => {
    logger.error('❌ ERRO FATAL (Uncaught Exception):', err.stack);
});

startServer().catch(err => {
    logger.error('❌ FALHA TOTAL NO STARTUP:', err.stack);
});
