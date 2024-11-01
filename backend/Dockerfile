FROM node:20-alpine3.19 AS base

WORKDIR /home/wm-tools/

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
COPY backend/package.json ./backend/package.json

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
COPY backend ./backend

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install \
    --recursive \
    --offline \
    --frozen-lockfile
RUN pnpm --filter backend build

FROM node:20-alpine3.19 AS runner

WORKDIR /home/wm-tools

COPY --from=prod-deps /home/wm-tools/node_modules ./node_modules
COPY --from=prod-deps /home/wm-tools/backend/node_modules ./backend/node_modules
COPY --from=prod-deps /home/wm-tools/backend/package.json ./backend/package.json

COPY --from=builder /home/wm-tools/backend/dist ./backend/dist

# Expose the backend port
EXPOSE 5101

CMD ["node", "/home/wm-tools/backend/dist/server.js"]

