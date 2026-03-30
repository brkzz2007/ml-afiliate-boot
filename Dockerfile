# Usar imagem oficial com Node e Chromium/Puppeteer
FROM ghcr.io/puppeteer/puppeteer:latest

# Definir como root para instalar dependências
USER root

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (limpa o cache e instala de forma silenciosa)
RUN npm install --omit=dev

# Copiar o restante do código
COPY . .

# Dar permissão para a pasta do Puppeteer e DB
RUN mkdir -p .wwebjs_auth .wwebjs_cache logs && \
    chown -R pptruser:pptruser /app

# Voltar para o usuário do Puppeteer para segurança
USER pptruser

EXPOSE 3005

CMD ["node", "src/server.js"]
