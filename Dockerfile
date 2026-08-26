# syntax=docker/dockerfile:1
# Builds and runs apps/backend (Medusa). Build context is the repo root
# so pnpm can resolve the workspace; the frontend (apps/web) deploys
# separately on Vercel and never runs through this image.

FROM node:22-alpine AS build
WORKDIR /repo
RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --frozen-lockfile

COPY apps/backend ./apps/backend
RUN pnpm --filter backend build

FROM node:22-alpine AS production
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production

COPY --from=build /repo/apps/backend/.medusa/server ./
# pnpm >=10 blocks install scripts for dependencies it doesn't know unless
# explicitly approved; .medusa/server is a fresh package.json copy with no
# such approval. The "pnpm" field in package.json is no longer read for this
# (pnpm 11) - it has to be a pnpm-workspace.yaml `allowBuilds` map instead.
RUN <<EOF
cat > pnpm-workspace.yaml <<'YAML'
packages:
  - "."
allowBuilds:
  '@medusajs/telemetry': true
  '@swc/core': true
  esbuild: true
  msgpackr-extract: true
  protobufjs: true
YAML
pnpm install --prod --no-frozen-lockfile
EOF

EXPOSE 9000
CMD ["pnpm", "start"]
