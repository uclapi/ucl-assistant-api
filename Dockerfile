FROM node:lts-alpine

WORKDIR /usr/src/server

ENV TINI_VERSION=v0.16.1

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

COPY package*.json ./

RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE ${PORT}

USER node
CMD [ "npm", "run", "start:prod" ]
