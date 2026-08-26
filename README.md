# ecommerce-luxe

Storefront headless de lujo. Monorepo con pnpm workspaces:

- `apps/web` — Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui. El storefront.
- `apps/backend` — MedusaJS v2 (autoalojado). Catálogo, carrito, órdenes, inventario.

## Requisitos

- Node.js 20+ (probado con Node 24)
- pnpm (`npm install -g pnpm` si no lo tienes)
- Docker Desktop corriendo (Postgres + Redis para el backend)

## Setup inicial

```bash
pnpm install
pnpm db:up            # levanta Postgres (localhost:5434) y Redis (localhost:6379)
cd apps/backend
cp .env.template .env # y completa DATABASE_URL, JWT_SECRET, COOKIE_SECRET
pnpm exec medusa db:migrate   # corre migraciones y siembra datos demo
pnpm exec medusa user -e tu@email.com -p tu-password   # crea tu usuario admin
```

`apps/web/.env.example` documenta las variables del frontend — cópialo a `.env.local` y define al menos `NEXT_PUBLIC_MEDUSA_BACKEND_URL` y `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (esta última la obtienes en `http://localhost:9000/app` → Settings → API Key Management, o vía `/admin/api-keys` con tu token de admin).

## Correr en desarrollo

Desde la raíz del repo, en dos terminales:

```bash
pnpm dev:backend   # http://localhost:9000  (admin en /app)
pnpm dev:web       # http://localhost:3000
```

## Variables de entorno

### `apps/backend/.env` (ver `.env.template`)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Postgres. Local: `postgres://medusa:medusa@localhost:5434/medusa_store` |
| `REDIS_URL` | Redis. Local: `redis://localhost:6379` |
| `JWT_SECRET` / `COOKIE_SECRET` | Cambiar en producción, nunca usar el valor por defecto |
| `STORE_CORS` / `ADMIN_CORS` / `AUTH_CORS` | Orígenes permitidos (incluye `http://localhost:3000` para el storefront) |

### `apps/web/.env.local` (ver `.env.example`)

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | URL del backend Medusa |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Publishable API key de Medusa (Store API) |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Fase 4 (pagos) |
| `RESEND_API_KEY` / `STORE_OWNER_EMAIL` | Fase 6 (notificaciones) |

## Infraestructura local

`docker-compose.yml` en la raíz levanta Postgres 15 y Redis 7 solo para este proyecto (puertos 5434/6379, aislados de otros proyectos en la misma máquina).

```bash
pnpm db:up     # levantar
pnpm db:down   # apagar
```

## Estado del proyecto

Ver el plan de fases en la conversación con Claude Code. Fase actual: **0 — Setup** completada.
