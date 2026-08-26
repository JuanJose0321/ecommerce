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
pnpm exec medusa db:migrate   # corre migraciones y siembra datos demo (region Europa/EUR)
pnpm exec medusa user -e tu@email.com -p tu-password   # crea tu usuario admin
pnpm run seed:luxury          # agrega region Mexico/MXN + catalogo de lujo (relojes, joyeria, moda, tecnologia)
```

Los 4 productos demo genericos de Medusa (T-Shirt, Sweatshirt, etc.) quedan sembrados pero en `draft` — no aparecen en el storefront. El catalogo real vive en `apps/backend/src/scripts/seed-luxury-catalog.ts`.

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
| `STRIPE_API_KEY` | Llave secreta de Stripe (`sk_test_...`). **Nunca** en el frontend ni en git. |
| `STRIPE_WEBHOOK_SECRET` | Ver sección "Pagos (Stripe)" abajo — necesario para OXXO y 3D Secure. |

### `apps/web/.env.local` (ver `.env.example`)

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | URL del backend Medusa |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Publishable API key de Medusa (Store API) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Llave publicable de Stripe (`pk_test_...`) — segura de exponer al navegador |
| `RESEND_API_KEY` / `STORE_OWNER_EMAIL` | Fase 7 (notificaciones) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Fase 6 (rate limiting, opcional) |

## Infraestructura local

`docker-compose.yml` en la raíz levanta Postgres 15 y Redis 7 solo para este proyecto (puertos 5434/6379, aislados de otros proyectos en la misma máquina).

```bash
pnpm db:up     # levantar
pnpm db:down   # apagar
```

## Catalogo (Fase 1)

El catalogo de lujo (relojes, joyeria, moda, tecnologia) usa fotografia de stock de Unsplash como placeholder — se reemplaza cuando haya fotografia/assets 3D reales del producto. Filtros por categoria, color, material y precio; orden por precio/novedad/popularidad (popularidad usa el orden curado del catalogo, aun no hay metricas reales de ventas/vistas).

## Pagos (Stripe)

Checkout con tarjeta (+ Apple/Google Pay vía el mismo Payment Element) y OXXO. Configurado en `apps/backend/medusa-config.ts` como parte del modulo `payment`, con `capture: true` (el cobro se captura de inmediato al confirmar, no queda en "autorizado" pendiente de captura manual).

OXXO tiene un limite real de Stripe de $10,000 MXN por voucher — el checkout lo oculta automaticamente si el total lo supera.

Para que los webhooks funcionen en local (OXXO y 3D Secure dependen de esto para actualizar la orden cuando el cliente paga despues, no en el momento):

```bash
stripe listen --forward-to localhost:9000/hooks/payment/stripe_stripe
```

(el segmento final tiene que ser el provider id completo sin el prefijo `pp_` — `stripe_stripe`, no `stripe`. Un solo endpoint cubre tarjeta y OXXO porque comparten la misma base de verificacion de firma.)

Copia el `whsec_...` que imprime a `STRIPE_WEBHOOK_SECRET` en `apps/backend/.env` y reinicia el backend. Sin esto, las tarjetas normales funcionan igual (la captura es sincrona), pero OXXO no actualizara el estado de la orden cuando el cliente pague en tienda.

## Seguridad y manejo de errores (Fase 6)

- Headers de seguridad (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS) en `next.config.ts`.
- Rate limiting en memoria (login, registro, cupones, reseñas) — suficiente para un solo servidor; cambiar por `@upstash/ratelimit` (Redis) antes de escalar a varias instancias.
- Reseñas ahora se crean vía workflow (`apps/backend/src/workflows/create-review.ts`) en vez de llamar el servicio directo desde la ruta, siguiendo la convención de Medusa.
- `error.tsx` / `not-found.tsx` de marca, y una pagina de mantenimiento que se muestra automaticamente si el backend no responde (root layout hace un health check antes de renderizar).
- Toasts (`sonner`) para: producto añadido/agotado, cupón aplicado/inválido, pago rechazado, error de red, sesión expirada.
- Banner de anuncio persistente (descuento activo) descartable por sesión.

## Notificaciones por correo (Fase 7)

Plantillas con `react-email` + envio con Resend. Sin dominio verificado en Resend, el sandbox **solo entrega al correo con el que te registraste** — cualquier otro destinatario (incluyendo los clientes de prueba del checkout) recibira un error 422 de Resend, logueado en consola pero sin romper el flujo. Ademas, la direccion compartida `onboarding@resend.dev` tiene una cuota muy baja (confirmada empiricamente: 12 correos/dia, 12/mes en esta cuenta) — facil de agotar en una sola sesion de pruebas con las 7 plantillas. Para produccion, verifica un dominio propio en Resend (elimina ambas restricciones).

Correos implementados (todos como subscribers de eventos nativos de Medusa, sin polling):

| Correo | Evento | Destinatario |
|---|---|---|
| Confirmacion de orden | `order.placed` | Cliente + `STORE_OWNER_EMAIL` |
| Orden enviada | `shipment.created` | Cliente |
| Orden entregada | `delivery.created` | Cliente |
| Bienvenida | `customer.created` | Cliente |
| Recuperar contrasena | `auth.password_reset` | Cliente |
| Alerta de pago fallido | `payment.webhook_received` (accion `failed`) | `STORE_OWNER_EMAIL` |
| Carrito abandonado | scheduled job cada hora (`src/jobs/abandoned-cart.ts`), 4h de inactividad | Cliente |

Recuperacion de contrasena end-to-end: `/account/forgot-password` (solicitar) → correo con link a `/account/reset-password?token=...` → nueva contrasena. El formulario de "olvide mi contrasena" siempre responde igual exista o no la cuenta, para no filtrar que correos estan registrados.

## Branding del admin (Fase 8)

Alcance deliberadamente ligero: solo favicon y wordmark de login, sin re-tema de colores (decidido junto contigo antes de empezar). Todo vía mecanismos oficiales de extension de Medusa, sin tocar el paquete `@medusajs/dashboard`:

- **Favicon**: `medusa-config.ts` usa `admin.vite` para (1) apuntar `publicDir` a `apps/backend/src/admin/public` (donde vive `favicon.svg`, un monograma "M" simple) y (2) un plugin de Vite con `transformIndexHtml` que reemplaza el favicon placeholder (`data:,`) del HTML generado y agrega el `<title>`.
- **Login**: `src/admin/widgets/login-branding.tsx` es un widget registrado en la zona `login.before` (la unica zona oficial para esa pagina) que muestra el wordmark "MAISON LUXE" arriba del formulario, con la misma tipografia tracked-uppercase que el storefront.
- El logo/icono del sidebar del admin **no** es personalizable via las zonas de extension oficiales (no existe una zona para eso) — reemplazarlo requeriria forkear `@medusajs/dashboard`, que quedo fuera de alcance a proposito.

Requiere reiniciar `pnpm dev:backend` para que `medusa-config.ts` tome efecto (no hace hot-reload). Verifica en `http://localhost:9000/app`: el favicon de la pestaña y el wordmark arriba del formulario de login.

## Testing / QA (Fase 9-10)

### Backend (`apps/backend`) — Jest

```bash
cd apps/backend
pnpm run test:unit               # logica pura (rate limiting), sin DB
pnpm run test:integration:modules  # servicio del modulo review contra Postgres real (schema aislado)
pnpm run test:integration:http     # arranca el backend completo y prueba /store/products/:id/reviews vía HTTP
```

Requiere `apps/backend/.env.test` (mismo Postgres/Redis de `docker compose`, no se versiona — ver `.env.template` para las variables `DB_HOST`/`DB_PORT`/`DB_USERNAME`/`DB_PASSWORD`/`DB_TEMP_NAME` que usa `@medusajs/test-utils`, distintas de las que usa `DATABASE_URL` en desarrollo normal). Cada test se ejecuta en un schema de Postgres aislado y lo limpia al terminar — no toca tus datos reales (verificado).

### Frontend (`apps/web`)

```bash
cd apps/web
pnpm test              # Vitest — logica pura: formato de precios, filtros/orden del catalogo,
                        # variantMatchesSelection (con test de regresion del bug de Fase 3), etc.
pnpm test:e2e           # Playwright — flujos criticos contra el servidor de dev ya corriendo
                        # (localhost:3000): catalogo -> carrito -> checkout hasta el paso de pago,
                        # busqueda, wishlist, menu movil en 375px
```

Playwright corre en dos proyectos: `chromium-desktop` y `mobile-375` (viewport 375x667). No automatiza el pago real con Stripe (el iframe de Stripe Elements es frágil de automatizar y ya lo verificaste manualmente con la tarjeta de prueba) — el test llega hasta que aparece el paso "Pago".

**Bugs reales encontrados y corregidos durante esta fase** (no solo cobertura nueva):

- El buscador (`Cmd/Ctrl+K`) crasheaba al escribir: `CommandDialog` nunca renderizaba la raíz `<Command>` de `cmdk`, dejando su store interno en `undefined`. Corregido en `search-dialog.tsx`.
- El CSP (`next.config.ts`) bloqueaba `eval()`, lo cual rompe el propio HMR/React Refresh de Next en modo desarrollo. Ahora `'unsafe-eval'` solo se permite fuera de producción.
- Los `<label>` de los formularios (login, registro, checkout, direcciones, reseñas, recuperar contraseña) no estaban asociados a su `<input>` — invisible a lectores de pantalla. Corregido con `useId()` + `htmlFor`/`id` en los 7 archivos afectados.
- Los scripts `test:unit`/`test:integration:*` de Medusa usan sintaxis `VAR=valor comando` que no corre en Windows fuera de Git Bash — se agregó `cross-env`.

### Lighthouse (pagina de producto)

Corrido con build de produccion (`pnpm build && pnpm start`) sobre `/products/reloj-bolsillo-heritage`:

| Preset | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Desktop | 99 | 98 | 100 | 100 |
| Mobile (default, 4G simulado) | 85 | 98 | 100 | 100 |

El unico punto por debajo de 90 es Performance en mobile, explicado enteramente por el LCP (4.4s): la foto de stock de Unsplash se sirve a través del optimizador de imagenes de Next, que la descarga del origen externo en tiempo real — bajo la simulacion de red lenta de Lighthouse, ese round-trip domina la metrica. Ya se corrigio `fetchPriority="high"` + `loading="eager"` en la imagen principal (`product-media.tsx`, `priority` estaba deprecado en Next 16 y ya no seteaba `fetchPriority` automaticamente), pero no mueve la aguja porque el cuello de botella es la transferencia de red, no el orden de carga. Se resuelve solo reemplazando las fotos de stock por fotografia real autoalojada (ya documentado como pendiente en la sección de Catálogo).

## Deploy (Fase 11)

Frontend en **Vercel**, backend en **Railway** (Postgres/Redis gestionados por Railway), Stripe en modo test, sin dominio propio (subdominios gratuitos). El `Dockerfile` en la raiz construye y corre `apps/backend`; `apps/web` no lo usa — Vercel lo despliega directo con su build nativo de Next.js.

### Backend (Railway)

1. Crea un servicio nuevo en Railway apuntando a este repo de GitHub. Railway detecta el `Dockerfile` de la raiz automaticamente (build context = raiz del repo, no `apps/backend`).
2. Agrega los plugins de **PostgreSQL** y **Redis** de Railway al mismo proyecto — te dan `DATABASE_URL`/`REDIS_URL` internos automaticamente (puedes referenciarlos como `${{Postgres.DATABASE_URL}}` / `${{Redis.REDIS_URL}}` en las variables del servicio backend).
3. Variables de entorno del servicio backend:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | referencia al plugin de Postgres |
   | `REDIS_URL` | referencia al plugin de Redis |
   | `JWT_SECRET` | generar nuevo, no reusar el de `.env` local |
   | `COOKIE_SECRET` | generar nuevo, no reusar el de `.env` local |
   | `STORE_CORS` | `https://tu-proyecto.vercel.app` |
   | `ADMIN_CORS` | `https://tu-backend.up.railway.app` |
   | `AUTH_CORS` | `https://tu-proyecto.vercel.app,https://tu-backend.up.railway.app` |
   | `STRIPE_API_KEY` | tu `sk_test_...` actual |
   | `STRIPE_WEBHOOK_SECRET` | ver paso 5 |
   | `RESEND_API_KEY` | tu key actual |
   | `STORE_OWNER_EMAIL` | tu correo actual |
   | `STOREFRONT_URL` | `https://tu-proyecto.vercel.app` |
   | `NODE_ENV` | `production` |

4. Tras el primer deploy exitoso, corre una sola vez (Railway shell o `railway run`, desde `apps/backend`):
   ```bash
   pnpm exec medusa db:migrate
   pnpm exec medusa user -e tu@email.com -p tu-password
   pnpm run seed:luxury
   ```
5. Crea un webhook en el dashboard de Stripe apuntando a `https://tu-backend.up.railway.app/hooks/payment/stripe_stripe` (evento `payment_intent.*` como minimo). Copia el `whsec_...` que te da a `STRIPE_WEBHOOK_SECRET` en Railway.

### Frontend (Vercel)

1. Importa el repo en Vercel. Root Directory: `apps/web` (Vercel detecta Next.js automaticamente, no necesita config extra).
2. Variables de entorno:

   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `https://tu-backend.up.railway.app` |
   | `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | la generas en `https://tu-backend.up.railway.app/app` → Settings → API Key Management, **despues** de sembrar el catalogo (paso 4 de arriba) |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | tu `pk_test_...` actual |
   | `RESEND_API_KEY` / `STORE_OWNER_EMAIL` | solo si algun Server Action del frontend los usa directo; las plantillas de correo viven en el backend |

### Pendiente, no bloqueante

- **Resend**: sin dominio verificado, producción tiene la misma restriccion de sandbox que local (cuota baja, solo entrega a tu propio correo — ver Fase 7).
- **Fotografia de producto**: Unsplash hotlinkeado, mismo impacto en Lighthouse mobile que en local (ver Fase 10).
- El Dockerfile fue probado localmente end-to-end (build + boot contra Postgres/Redis reales) antes de subirlo.

## Estado del proyecto

Ver el plan de fases en la conversación con Claude Code. Fase actual: **11 — Deploy** en progreso.
