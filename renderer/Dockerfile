FROM node:24.1.0-slim

ENV LANG=en_US.UTF-8 \
    PPTRUSER_UID=10042 \
    NODE_ENV=production

RUN apt-get update \
    && apt-get install -y --no-install-recommends libnss3 libatk1.0-0 \
    libatk-bridge2.0-0 libcups2 libgbm1 libasound2 libpangocairo-1.0-0 libxss1 libgtk-3-0

RUN groupadd -r pptruser && useradd -u $PPTRUSER_UID -rm -g pptruser -G audio,video pptruser
USER $PPTRUSER_UID

WORKDIR /home/pptruser

COPY --chown=pptruser:pptruser package.json server.js ./
RUN npm install


EXPOSE 8080
CMD [ "node", "server.js" ]
