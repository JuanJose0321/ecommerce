import path from 'node:path'
import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    vite: (config) => {
      const faviconHref = `${(config.base ?? '/app').replace(/\/$/, '')}/favicon.svg`
      return {
        publicDir: path.resolve(__dirname, 'src/admin/public'),
        plugins: [
          {
            name: 'maison-luxe-admin-branding',
            transformIndexHtml: {
              order: 'post',
              handler: (html: string) =>
                html
                  .replace(
                    /<link rel="icon" href="data:," data-placeholder-favicon \/>/,
                    `<link rel="icon" type="image/svg+xml" href="${faviconHref}" />`
                  )
                  .replace('<head>', '<head>\n        <title>Maison Luxe — Admin</title>'),
            },
          },
        ],
      }
    },
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: './src/modules/review',
    },
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: '@medusajs/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              capture: true,
              asyncPaymentMethodTypes: ['oxxo'],
            },
          },
        ],
      },
    },
  ],
})
