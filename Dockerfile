FROM node:lts-alpine AS base
RUN apk add --no-cache tini
WORKDIR /usr/src/server
ENV TINI_VERSION=v0.16.1
ENTRYPOINT ["/sbin/tini", "--"]
COPY package*.json ./
RUN npm i -g pino

FROM base AS dependencies
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM base as release
COPY --from=dependencies /usr/src/server/node_modules ./node_modules
COPY --from=build /usr/src/server/dist ./dist
EXPOSE ${PORT}
USER node
CMD npm run start:prod | pino
