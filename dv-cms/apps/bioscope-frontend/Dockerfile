# ── Multi-stage build for bioscope-frontend (pnpm monorepo) ──
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# Single stage build — pnpm workspace symlinks must be created in the same
# filesystem tree where the actual source files live. Copying node_modules
# between stages (via --from=deps) breaks workspace symlinks for monorepo
# packages like @dv/cms-core and causes "Module not found" at build time.
# We accept the longer install time in exchange for build reliability.
FROM base AS build
ARG NEXT_PUBLIC_CMS_URL=http://localhost:3001
ARG NEXT_PUBLIC_SITE_URL=https://web.bioscope.vn
ENV NEXT_PUBLIC_CMS_URL=$NEXT_PUBLIC_CMS_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Copy everything needed for pnpm install — lockfile + all source
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY patches ./patches
COPY packages ./packages
COPY apps/bioscope-frontend ./apps/bioscope-frontend
# Filter by app so pnpm only walks the frontend's dep graph. The root
# package.json has a patchedDependencies entry for @payloadcms/next which is
# only installed by core-cms — without --filter, pnpm would refuse to install
# because the patched package isn't in the resolved graph.
RUN pnpm install --filter @dv/bioscope-frontend... --no-frozen-lockfile
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
