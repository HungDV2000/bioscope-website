# ── Multi-stage build for core-cms (pnpm monorepo) ──
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# Install workspace dependencies
FROM base AS deps
COPY pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/core-cms/package.json ./apps/core-cms/package.json
RUN pnpm install --no-frozen-lockfile

# Build the Next/Payload app
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .
RUN pnpm --filter @dv/core-cms build

# Runtime
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app ./
WORKDIR /app/apps/core-cms
EXPOSE 3001
CMD ["pnpm", "start"]
