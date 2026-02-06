# Use Node.js LTS version
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files and prisma schema
COPY package.json package-lock.json* ./
COPY prisma ./prisma
# Install dependencies
RUN npm install --frozen-lockfile || npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js (prisma generate will run via postinstall)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Create startup script as root, then change ownership
RUN echo '#!/bin/sh' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo 'echo "[PRISMA] Running database migrations..."' >> /app/docker-entrypoint.sh && \
    echo 'npx prisma db push --accept-data-loss --skip-generate' >> /app/docker-entrypoint.sh && \
    echo 'echo "[PRISMA] Database migrations completed successfully"' >> /app/docker-entrypoint.sh && \
    echo 'echo "[NEXT] Starting Next.js application..."' >> /app/docker-entrypoint.sh && \
    echo 'exec node_modules/.bin/next start' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh && \
    chown nextjs:nodejs /app/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations and start the application
CMD ["/app/docker-entrypoint.sh"]
