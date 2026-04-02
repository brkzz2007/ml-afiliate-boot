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
    
    // Injetar status inicial no publisher para o feedback da rota /qr
    const whatsappPublisher = require('./publishers/whatsapp.publisher');
    whatsappPublisher.initStatus = 'Iniciando servidor web...';

    // 1. Iniciar servidor web IMEDIATAMENTE (Passo crucial para o Render)
    try {
        app.listen(env.port, '0.0.0.0', () => {
            logger.info(`🚀 Servidor pronto na porta ${env.port}. Motor: ${env.nodeEnv}`);
        });
    } catch (e) {
        logger.error('❌ Não foi possível iniciar o servidor web:', e.message);
        process.exit(1);
    }

    try {
        // 2. Iniciar o Motor do WhatsApp (BAILEYS PRIMEIRO)
        whatsappPublisher.initStatus = 'Carregando Motor do WhatsApp...';
        whatsappPublisher.initialize().catch(err => {
            whatsappPublisher.initStatus = `Erro no WhatsApp: ${err.message}`;
            logger.error('⚠️ Falha na inicialização do Baileys:', err.message);
        });

        // 3. Inicializar o banco de dados (EM SEGUNDO PLANO)
        setTimeout(async () => {
            try {
                whatsappPublisher.initStatus = 'Configurando Banco de Dados...';
                await initializeDB();
                logger.info('✅ Banco de Dados Pronto.');
                whatsappPublisher.initStatus = 'Pronto para Conectar';
            } catch (dbErr) {
                logger.error('Erro no DB:', dbErr.message);
            }
        }, 5000); // 5 segundos de folga para o WhatsApp respirar
        
        // 4. Iniciar Cron Jobs
        const { startCaptureJob } = require('./jobs/capture.job');
        const { startPublishJob } = require('./jobs/publisher.job');
        const { startCleanupJob } = require('./jobs/cleanup.job');

        startCleanupJob();
        startCaptureJob();
        startPublishJob();

    } catch (error) {
        logger.error('⚠️ Falha durante o boot:', error.message);
    }
};

// Captura qualquer erro não tratado para mostrar no log
process.on('uncaughtException', (err) => {
    logger.error('❌ ERRO FATAL (Uncaught Exception):', err.stack);
});

startServer().catch(err => {
    logger.error('❌ FALHA TOTAL NO STARTUP:', err.stack);
});
