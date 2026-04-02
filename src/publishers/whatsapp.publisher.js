const pino = require('pino');
const env = require('../config/env');
const logger = require('../config/logger');
const path = require('path');
const fs = require('fs');

class WhatsappPublisher {
  constructor() {
    this.sock = null;
    this.latestQr = null;
    this.latestPairingCode = null;
    this.isReady = false;
    this.initStatus = 'Aguardando...';
    this.logs = [];
    this.authPath = path.resolve(process.cwd(), '.baileys_auth');
    
    if (!fs.existsSync(this.authPath)) {
        try { fs.mkdirSync(this.authPath, { recursive: true }); } catch (e) {}
    }
  }

  addLog(msg) {
    const time = new Date().toLocaleTimeString();
    this.logs.unshift(`[${time}] ${msg}`);
    if (this.logs.length > 5) this.logs.pop();
    logger.info(msg);
  }

  async initialize() {
    // Evita múltiplas instâncias rodando juntas (Causa erro 405)
    if (this.sock) {
        try { this.sock.ev.removeAllListeners(); } catch(e) {}
        this.sock = null;
    }

    this.addLog('⚙️ Iniciando motor...');
    try {
        const baileys = await import('@whiskeysockets/baileys');
        const { default: makeWASocket, useMultiFileAuthState } = baileys;
        const { Boom } = await import('@hapi/boom');

        const { state, saveCreds } = await useMultiFileAuthState(this.authPath);

        this.sock = makeWASocket({
          auth: state,
          printQRInTerminal: true, // Volta a mostrar no terminal para conferência
          logger: pino({ level: 'silent' }),
          browser: ['Chrome', 'macOS', '1.0.0'],
          connectTimeoutMs: 60000,
          generateHighQualityQR: true
        });

        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', (update) => {
          const { connection, lastDisconnect, qr } = update;
          
          if (qr) {
            this.latestQr = qr;
            this.initStatus = 'QR Code Pronto!';
            this.addLog('📱 QR Code gerado.');
          }

          if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) ? 
                lastDisconnect.error.output?.statusCode !== 401 : true;
            
            this.isReady = false;
            this.initStatus = 'Reconectando...';
            this.addLog(`❌ Conexão fechada. Reconectando: ${shouldReconnect}`);
            if (shouldReconnect) setTimeout(() => this.initialize(), 15000);
          } else if (connection === 'open') {
            this.initStatus = '✅ Conectado!';
            this.isReady = true;
            this.latestQr = null;
            this.latestPairingCode = null;
            this.addLog('✅ Conexo realizada!');
          }
        });
    } catch (err) {
        this.addLog(`❌ Erro no boot: ${err.message}`);
    }
  }

  async triggerPairing(phoneNumber) {
    if (!this.sock) return null;
    try {
        const num = phoneNumber.replace(/\D/g, '');
        const code = await this.sock.requestPairingCode(num);
        this.latestPairingCode = code;
        this.addLog(`🔑 Código gerado para ${num}: ${code}`);
        return code;
    } catch (e) {
        this.addLog(`❌ Falha no código: ${e.message}`);
        return null;
    }
  }

  async publish(item) {
    if (!this.isReady || !this.sock) return false;
    try {
      const targetNumber = env.whatsappTargetNumber;
      const targetGroup = env.whatsappTargetGroup;
      let chatId = null;

      if (targetGroup) {
          const groups = await this.sock.groupFetchAllParticipating();
          const group = Object.values(groups).find(g => g.subject.toLowerCase() === targetGroup.toLowerCase());
          if (group) chatId = group.id;
      }

      if (!chatId && targetNumber) {
          chatId = `${String(targetNumber).replace(/\D/g, '')}@s.whatsapp.net`;
      }

      if (!chatId) return false;

      await this.sock.sendMessage(chatId, {
          image: { url: item.image_url },
          caption: item.formatted_message
      });
      return true;
    } catch (error) {
      logger.error('Erro ao publicar:', error);
      return false;
    }
  }
}

module.exports = new WhatsappPublisher();
