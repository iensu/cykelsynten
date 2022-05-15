FROM node:16-slim

WORKDIR /app

COPY . .

RUN npm ci

USER node

ENV PORT=8080

ENTRYPOINT [ "node", "./server.js" ]
