const { db } = require('./init');
const logger = require('../config/logger');

// Salva Produto com Bypass de Conflito (Postgres style)
const saveProduct = async (product) => {
    try {
        const query = `
            INSERT INTO products (id, title, price, link, image_url, description)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO NOTHING
        `;
        const res = await db.run(query, [product.id, product.title, product.price, product.link, product.imageUrl, product.description]);
        return res.rowCount;
    } catch (err) {
        logger.error('Erro ao salvar produto no Banco:', err);
        throw err;
    }
};

const getProductById = async (id) => {
    const query = 'SELECT * FROM products WHERE id = ?';
    return await db.get(query, [id]);
};

const enqueueProduct = async (queueItem) => {
    try {
        const query = `
            INSERT INTO queue (product_id, raw_message, formatted_message, status)
            VALUES (?, ?, ?, 'approved')
            ON CONFLICT (product_id) DO NOTHING
        `;
        const res = await db.run(query, [queueItem.productId, queueItem.rawMessage, queueItem.formattedMessage]);
        return res.rowCount;
    } catch (err) {
        logger.error('Erro ao enfileirar no Banco:', err);
        throw err;
    }
};

const getQueue = async (status) => {
    let query = 'SELECT q.*, p.title, p.price, p.link FROM queue q JOIN products p ON q.product_id = p.id';
    let params = [];
    if (status) {
        query += ' WHERE q.status = ?';
        params.push(status);
    }
    query += ' ORDER BY q.created_at ASC';
    return await db.all(query, params);
};

const updateQueueStatus = async (id, status) => {
    const query = 'UPDATE queue SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const res = await db.run(query, [status, id]);
    return res.rowCount;
};

const getNextApprovedItem = async () => {
    try {
        // 1. Pega os IDs dos últimos 10 produtos publicados para evitar repetição recente
        const recentPublishedQuery = `
            SELECT q.product_id FROM queue q
            WHERE q.status = 'published'
            ORDER BY q.updated_at DESC LIMIT 10
        `;
        const recentItems = await db.all(recentPublishedQuery, []);
        const recentIds = recentItems.map(r => r.product_id);

        // 2. Tenta pegar um aprovado que NÃO esteja nos recentes — de forma ALEATÓRIA
        let item = null;
        if (recentIds.length > 0) {
            const placeholders = recentIds.map(() => '?').join(',');
            const query = `
                SELECT q.*, p.title, p.image_url, p.description 
                FROM queue q 
                JOIN products p ON q.product_id = p.id 
                WHERE q.status = 'approved' 
                AND q.product_id NOT IN (${placeholders})
                ORDER BY RANDOM()
                LIMIT 1
            `;
            item = await db.get(query, recentIds);
        }

        // 3. Fallback: se todos os aprovados já foram publicados recentemente, pega QUALQUER um aleatoriamente
        if (!item) {
            const fallbackQuery = `
                SELECT q.*, p.title, p.image_url, p.description 
                FROM queue q 
                JOIN products p ON q.product_id = p.id 
                WHERE q.status = 'approved' 
                ORDER BY RANDOM()
                LIMIT 1
            `;
            item = await db.get(fallbackQuery, []);
        }

        return item;
    } catch (err) {
        logger.error('Erro ao buscar próximo item da fila:', err);
        return null;
    }
};

const clearQueue = async () => {
    try {
        await db.run('DELETE FROM queue', []);
        const res = await db.run('DELETE FROM products', []);
        return res.rowCount;
    } catch (err) {
        logger.error('Erro ao limpar banco:', err);
    }
};


module.exports = {
  saveProduct,
  getProductById,
  enqueueProduct,
  getQueue,
  updateQueueStatus,
  getNextApprovedItem,
  clearQueue
};
