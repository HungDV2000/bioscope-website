# ── Multi-stage build for bioscope-frontend (pnpm monorepo) ──
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY patches ./patches
COPY apps/bioscope-frontend/package.json ./apps/bioscope-frontend/package.json
RUN pnpm install --frozen-lockfile

FROM base AS build
# Public URLs are inlined into the bundle at build time — must be passed as args.
ARG NEXT_PUBLIC_CMS_URL=http://localhost:3001
ARG NEXT_PUBLIC_SITE_URL=https://web.bioscope.vn
ENV NEXT_PUBLIC_CMS_URL=$NEXT_PUBLIC_CMS_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/bioscope-frontend/node_modules ./apps/bioscope-frontend/node_modules
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY patches ./patches
COPY apps/bioscope-frontend ./apps/bioscope-frontend
WORKDIR /app/apps/bioscope-frontend
RUN pnpm exec next build --webpack

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/apps/bioscope-frontend
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/bioscope-frontend /app/apps/bioscope-frontend
# Container port dải 26xxx — tránh xung đột 3000/3001 nếu container join host network
ARG FE_INTERNAL_PORT=26300
ENV PORT=${FE_INTERNAL_PORT}
EXPOSE ${FE_INTERNAL_PORT}
CMD ["sh", "-c", "exec node /app/node_modules/next/dist/bin/next start -p ${FE_INTERNAL_PORT}"]
