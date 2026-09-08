# --- Stage 1: Prune monorepo ---
FROM node:20-alpine AS builder
RUN apk add --no-libc-dev libc6-compat
WORKDIR /app
RUN yarn global add turbo
COPY . .
# Extract only what is needed for api-gateway
RUN turbo prune --scope=api-gateway --docker

# --- Stage 2: Install dependencies & Build ---
FROM node:20-alpine AS installer
RUN apk add --no-libc-dev libc6-compat
WORKDIR /app

# Copy lock files and manifests
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock

# Enable Corepack for Yarn 4
RUN corepack enable

# Install dependencies
RUN yarn install

# Copy source code and build
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN yarn turbo build --filter=api-gateway...

# --- Stage 3: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer /app/apps/api-gateway/dist ./dist
COPY --from=installer /app/apps/api-gateway/package.json ./package.json
COPY --from=installer /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main.js"]