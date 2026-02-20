# Idle Page — Docker image (spec §3.5, §6.3)
# Node 20+ as per implementation plan.
FROM node:20-alpine AS base

# Install dependencies (for private registry: docker build --secret id=npm,src=$HOME/.npmrc ...)
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=secret,id=npm,target=/root/.npmrc,required=false \
  npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Default base paths for mounted data (override in docker-compose)
ENV TODO_BASE_PATH=/data
ENV MEDIA_BASE_PATH=/data

CMD ["node", "server.js"]
