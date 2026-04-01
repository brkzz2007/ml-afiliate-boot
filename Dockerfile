FROM node:20-bullseye

# Instalar dependências para compilar sqlite3 se necessário
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

# Criar a pasta de autenticação do whatsapp
RUN mkdir -p .wwebjs_auth

EXPOSE 3000

CMD [ "npm", "start" ]
