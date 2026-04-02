FROM node:20

# Instalando ferramentas de compilação essenciais
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Usaremos o /tmp para a sessão por ser mais rápido no Render Free
RUN mkdir -p /tmp/.baileys_auth && chmod 777 /tmp/.baileys_auth

EXPOSE 3000

CMD [ "node", "src/server.js" ]
