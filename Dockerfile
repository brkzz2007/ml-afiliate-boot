FROM node:20-slim

# Dependências mínimas para compilar o SQLite no Linux
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

# Instala apenas o necessário, economizando RAM
RUN npm install --omit=dev

COPY . .

# Permissões para o banco e WhatsApp
RUN mkdir -p .baileys_auth && chmod 777 .baileys_auth

EXPOSE 3000

# Execução direta para o Render monitorar melhor
CMD [ "node", "src/server.js" ]
