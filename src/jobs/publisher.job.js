const cron = require('node-cron');
const env = require('../config/env');
const logger = require('../config/logger');
const repository = require('../database/repository');
const publisher = require('../publishers/whatsapp.publisher');

const publishTask = async () => {
  logger.info('Verificando fila de publicação...');
  try {
    // Publica até 5 itens por ciclo para não ficar lento
    const maxPerCycle = 5;
    let publishedCount = 0;

    for (let i = 0; i < maxPerCycle; i++) {
      const item = await repository.getNextApprovedItem();
      
      if (!item) {
        if (publishedCount === 0) {
          logger.info('Nenhum item aprovado na fila para publicar agora.');
        }
        break;
      }

      logger.info(`Tentando publicar item com ID da fila: ${item.id}`);
      const success = await publisher.publish(item);

      if (success) {
        await repository.updateQueueStatus(item.id, 'published');
        publishedCount++;
        logger.info(`✅ Item ${item.id} publicado com sucesso. (${publishedCount}/${maxPerCycle})`);
        
        // Aguarda 30 segundos entre posts para não parecer spam
        if (i < maxPerCycle - 1) {
          await new Promise(r => setTimeout(r, 30000));
        }
      } else {
        logger.error(`Falha ao publicar item ${item.id}. Tentando próximo.`);
      }
    }

    if (publishedCount > 0) {
      logger.info(`📊 Ciclo de publicação finalizado: ${publishedCount} itens publicados.`);
    }

  } catch (error) {
    logger.error('Erro no job de publicação:', error);
  }
};

const startPublishJob = () => {
  logger.info(`Agendando job de publicação com cron: ${env.cronPublishSchedule}`);
  cron.schedule(env.cronPublishSchedule, publishTask);
};

module.exports = { startPublishJob, publishTask };
