# ── Multi-stage build for core-cms (pnpm monorepo) ──
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# Single stage build — see comment in apps/bioscope-frontend/Dockerfile for why
# we don't use a separate `deps` stage (pnpm workspace symlinks break otherwise).
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--no-deprecation

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY patches ./patches
COPY packages ./packages
COPY apps/core-cms ./apps/core-cms
RUN pnpm install --filter @dv/core-cms... --no-frozen-lockfile
WORKDIR /app/apps/core-cms
RUN pnpm exec next build --webpack

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--no-deprecation
WORKDIR /app/apps/core-cms
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/packages /app/packages
COPY --from=build /app/apps/core-cms /app/apps/core-cms
# Container port dải 26xxx — tránh xung đột 3000/3001 nếu container join host network
ARG CMS_INTERNAL_PORT=26301
ENV PORT=${CMS_INTERNAL_PORT}
EXPOSE ${CMS_INTERNAL_PORT}
# next lives in apps/core-cms/node_modules/next (pnpm hoists under app dir,
# not at /app/node_modules). Run relative to WORKDIR.
CMD ["sh", "-c", "exec node ./node_modules/next/dist/bin/next start -p ${PORT}"]
