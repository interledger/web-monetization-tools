FROM node:20-alpine3.19 AS base

WORKDIR /home/wm-tools

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN corepack prepare pnpm@9.12.1 --activate

COPY pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm fetch \
    | grep -v "cross-device link not permitted\|Falling back to copying packages from store"

FROM base AS prod-deps

COPY package.json pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/package.json

RUN pnpm clean
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install \
    --recursive \
    --prefer-offline \
    --frozen-lockfile \
    --prod \
    | grep -v "cross-device link not permitted\|Falling back to copying packages from store"

FROM base AS builder   

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY frontend ./frontend

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install \
    --recursive \
    --offline \
    --frozen-lockfile
RUN pnpm --filter frontend build
RUN pnpm --filter frontend build:init

FROM node:20-alpine3.19 AS runner

WORKDIR /home/wm-tools

COPY --from=prod-deps /home/wm-tools/node_modules ./node_modules
COPY --from=prod-deps /home/wm-tools/frontend/node_modules ./frontend/node_modules
COPY --from=prod-deps /home/wm-tools/frontend/package.json ./frontend/package.json

COPY --from=builder /home/wm-tools/frontend/build ./frontend/build
COPY --from=builder /home/wm-tools/frontend/public ./frontend/public

WORKDIR /home/wm-tools/frontend

CMD ["sh", "./node_modules/.bin/remix-serve", "./build/server/index.js"]
