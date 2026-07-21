# ── Multi-stage build for core-cms (pnpm monorepo) ──
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# Single stage build — see comment in apps/bioscope-frontend/Dockerfile for why
# we don't use a separate `deps` stage (pnpm workspace symlinks break otherwise).
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--no-deprecation
# assetPrefix must be baked at BUILD time so webpack's runtime publicPath uses it
# (Better Editor same-origin preview). Runtime-only env is too late for chunks.
ARG CMS_ASSET_PREFIX=
ENV CMS_ASSET_PREFIX=${CMS_ASSET_PREFIX}

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
# pg_dump for the admin "Sao lưu dữ liệu" endpoint (GET /api/backup).
# Pinned to 16 to match the postgres:16-alpine service — pg_dump refuses to dump
# a server newer than itself.
RUN apk add --no-cache postgresql16-client
# Keep the same prefix at runtime so the server-rendered HTML matches the bundle.
ARG CMS_ASSET_PREFIX=
ENV CMS_ASSET_PREFIX=${CMS_ASSET_PREFIX}
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
