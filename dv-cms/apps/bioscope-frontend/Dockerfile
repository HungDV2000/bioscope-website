# ── Multi-stage build for bioscope-frontend (pnpm monorepo) ──
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/bioscope-frontend/package.json ./apps/bioscope-frontend/package.json
RUN pnpm install --frozen-lockfile

FROM base AS build
ARG NEXT_PUBLIC_CMS_URL=http://localhost:3001
ENV NEXT_PUBLIC_CMS_URL=$NEXT_PUBLIC_CMS_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/bioscope-frontend/node_modules ./apps/bioscope-frontend/node_modules
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY apps/bioscope-frontend ./apps/bioscope-frontend
WORKDIR /app/apps/bioscope-frontend
RUN pnpm exec next build --webpack

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/apps/bioscope-frontend
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/bioscope-frontend /app/apps/bioscope-frontend
EXPOSE 3000
ENV PORT=3000
CMD ["pnpm", "exec", "next", "start", "-p", "3000"]
