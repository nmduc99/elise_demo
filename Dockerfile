# syntax=docker/dockerfile:1.6
ARG NODE_VERSION=20.18.0

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
ENV CI=true \
    NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
# Cần devDependencies để build Next.js
RUN npm ci

FROM base AS build
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Yêu cầu: next.config.js phải có { output: 'standalone' }
RUN npm run build

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
# PORT sẽ được set qua environment variable trong docker-compose.yml

RUN apk add --no-cache libc6-compat tini curl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy artefacts từ build standalone
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next/cache

# EXPOSE port sẽ được set động qua docker-compose.yml (DEV: 4002, UAT: 3002)
# EXPOSE chỉ là metadata, port mapping được định nghĩa trong docker-compose.yml
USER nextjs
ENTRYPOINT ["tini", "--"]
CMD ["node", "server.js"]