# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
# Force install of devDependencies even if NODE_ENV=production leaks in from the host
RUN npm ci --no-audit --no-fund --include=dev

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Tailwind/Next build stage must NOT have NODE_ENV=production set, or PostCSS resolves devDeps from the wrong tree.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001 \
    HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/package.json ./package.json
USER nextjs
EXPOSE 3001
CMD ["node", "server.js"]
