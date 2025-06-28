# BASE
FROM node:22.17.0-bookworm-slim AS app-base

ARG NODE_ENV=local
ARG APP_DEBUG=false
ARG APP_PORT=3000

ENV TINI_VERSION=0.19.0-1
ENV NODE_ENV=${NODE_ENV}
ENV APP_DEBUG=${APP_DEBUG}
ENV APP_PORT=${APP_PORT}

RUN apt-get update && apt-get install -y --no-install-recommends \
    tini=${TINI_VERSION} \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /app && chown -R node:node /app

WORKDIR /app

USER node

EXPOSE ${APP_PORT}

HEALTHCHECK --retries=5 CMD [ "curl -fs http://localhost:${APP_PORT}/health || exit 1;" ]

ENTRYPOINT ["tini", "--"]

CMD ["sh", "-c", "if [ \"$APP_DEBUG\" = 'true' ]; then npm run start:debug; else npm run start:dev; fi"]


# DEVELOPMENT
FROM app-base AS app-development

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .


# BUILD
FROM app-development AS app-build

RUN npm run build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN npm ci --ignore-scripts --omit=dev && npm cache clean --force


# PRODUCTION
FROM app-base AS app-production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=app-build --chown=node:node /app/dist .
COPY --from=app-build --chown=node:node /app/node_modules ./node_modules

CMD ["sh", "-c", "node main.js"]
