FROM ghcr.io/puppeteer/puppeteer:21.9.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./
# Run npm install with root user so we can install packages
USER root
RUN npm install
COPY . .
RUN chown -R pptruser:pptruser /usr/src/app

USER pptruser

CMD [ "npm", "start" ]
