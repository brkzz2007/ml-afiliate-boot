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
  try {
    // Inicializar o banco de dados
    await initializeDB();
    
    // Iniciar jobs
    startCleanupJob();
    startCaptureJob();
    startPublishJob();

    // Executar limpeza inicial como precaução
    await cleanupTask();

    // Disparar uma captura inicial daqui a 120 segundos (2 minutos)
    // Isso dá tempo do WhatsApp conectar/gerar QR sem competir por RAM com o Scraper.
    setTimeout(() => {
        logger.info('🚀 Disparando captura inicial segura (após delay de 120s para equilibrar RAM)...');
        const { captureTask } = require('./jobs/capture.job');
        captureTask();
    }, 120000);

    // Iniciar servidor web
    app.listen(env.port, () => {
      logger.info(`Servidor rodando na porta ${env.port}`);
    });
  } catch (error) {
    logger.error('Falha ao iniciar a aplicação:', error);
    process.exit(1);
  }
};

startServer();
