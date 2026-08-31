// Standalone Admin API script — creates ONLY the 8 new products below.
// Does NOT touch regions, shipping, or existing products, and never re-runs
// the full seed-luxury-catalog.ts (which would duplicate the whole catalog).
//
// Runs as a plain Node script against the Admin REST API over HTTP, so it
// works against ANY reachable Medusa backend (local dev or a deployed
// production instance) — it does not need `medusa exec` or the backend's
// in-process environment.
//
// Usage:
//   MEDUSA_BACKEND_URL=https://your-backend.example.com \
//   MEDUSA_ADMIN_EMAIL=admin@example.com \
//   MEDUSA_ADMIN_PASSWORD=your-password \
//   node src/scripts/create-catalog-expansion.mjs
//
// Optional: DRY_RUN=1 to only resolve categories/shipping profile/sales
// channel and print what WOULD be created, without creating anything.

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD
const DRY_RUN = process.env.DRY_RUN === "1"

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Missing MEDUSA_ADMIN_EMAIL / MEDUSA_ADMIN_PASSWORD environment variables."
  )
  process.exit(1)
}

const NEW_PRODUCTS = [
  {
    title: "Reloj Minimalista Nocturne",
    category: "Relojes",
    description:
      "Reloj de esfera negra mate con bisel delgado y correa de malla milanesa. Diseño depurado para el día a día sin perder carácter.",
    handle: "reloj-minimalista-nocturne",
    image: "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=1200&q=80",
    axes: [
      { title: "Material", values: ["Acero Cepillado", "Acero Negro"] },
      { title: "Correa", values: ["Malla Milanesa", "Piel Negra"] },
    ],
    priceMxn: 24800,
    priceUsd: 1370,
  },
  {
    title: "Reloj Bracelet Aurora Plata",
    category: "Relojes",
    description:
      "Reloj bracelet en acero plateado con eslabones articulados y esfera lacada blanca. Una pieza statement que fusiona joyería y relojería.",
    handle: "reloj-bracelet-aurora-plata",
    image: "https://images.unsplash.com/photo-1645961855223-f5b203e47f2f?w=1200&q=80",
    axes: [
      { title: "Material", values: ["Acero Plateado", "Acero Dorado"] },
      { title: "Correa", values: ["Eslabones Anchos", "Eslabones Finos"] },
    ],
    priceMxn: 31500,
    priceUsd: 1740,
  },
  {
    title: "Anillo Halo Rosé",
    category: "Joyería",
    description:
      "Anillo con zafiro rosa central rodeado de pavé de diamantes, montado en oro rosa de 18k. Elegancia atemporal para ocasiones especiales.",
    handle: "anillo-halo-rose",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=1200&q=80",
    axes: [
      { title: "Metal", values: ["Oro Rosa 18k", "Oro Blanco 18k"] },
      { title: "Talla", values: ["6", "7"] },
    ],
    priceMxn: 39500,
    priceUsd: 2180,
  },
  {
    title: "Anillo Piedra Turquesa",
    category: "Joyería",
    description:
      "Anillo delicado con piedra turquesa cabujón engastada en oro vermeil. Pensado para combinarse en capas con otras piezas.",
    handle: "anillo-piedra-turquesa",
    image: "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=1200&q=80",
    axes: [
      { title: "Metal", values: ["Oro Vermeil", "Plata"] },
      { title: "Talla", values: ["6", "7"] },
    ],
    priceMxn: 15800,
    priceUsd: 875,
  },
  {
    title: "Blazer Estructurado Onyx",
    category: "Moda",
    description:
      "Blazer entallado en lana fría con forro interior de viscosa y solapa de pico. Corte moderno para el guardarropa formal.",
    handle: "blazer-estructurado-onyx",
    image: "https://images.unsplash.com/photo-1585412459212-8def26f7e84c?w=1200&q=80",
    axes: [
      { title: "Talla", values: ["S", "M", "L"] },
      { title: "Color", values: ["Negro", "Grafito"] },
    ],
    priceMxn: 22500,
    priceUsd: 1245,
  },
  {
    title: "Botas Chelsea Reserve",
    category: "Moda",
    description:
      "Botas Chelsea en piel pulida a mano con elástico lateral y suela de cuero. Un básico de lujo para cualquier temporada.",
    handle: "botas-chelsea-reserve",
    image: "https://images.unsplash.com/photo-1777987601677-3059be0e1388?w=1200&q=80",
    axes: [
      { title: "Talla", values: ["26", "27", "28"] },
      { title: "Color", values: ["Café", "Negro"] },
    ],
    priceMxn: 13200,
    priceUsd: 730,
  },
  {
    title: "Altavoz Portátil Resonance",
    category: "Tecnología",
    description:
      "Altavoz portátil con acabado cerámico mate y sonido envolvente de 360°. Diseño circular pensado para integrarse a cualquier espacio.",
    handle: "altavoz-portatil-resonance",
    image: "https://images.unsplash.com/photo-1675319245480-215961c129f1?w=1200&q=80",
    axes: [
      { title: "Color", values: ["Blanco Perla", "Grafito"] },
      { title: "Edición", values: ["Estándar", "Pro"] },
    ],
    priceMxn: 8400,
    priceUsd: 465,
  },
  {
    title: "Cámara Retro Voyage",
    category: "Tecnología",
    description:
      "Cámara de estilo vintage con cuerpo en tono champán y funda de piel color café. Una pieza de colección para los amantes de la fotografía analógica.",
    handle: "camara-retro-voyage",
    image: "https://images.unsplash.com/photo-1520549233664-03f65c1d1327?w=1200&q=80",
    axes: [
      { title: "Color", values: ["Champan", "Grafito"] },
      { title: "Edición", values: ["Estándar", "Coleccionista"] },
    ],
    priceMxn: 11500,
    priceUsd: 635,
  },
]

async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${text}`)
  }
  return data
}

async function main() {
  console.log(`Backend: ${BACKEND_URL}`)
  console.log("Authenticating...")
  const { token } = await api("/auth/user/emailpass", {
    method: "POST",
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  })

  const { stores } = await api("/admin/stores", { token })
  const defaultSalesChannelId = stores[0].default_sales_channel_id

  const { shipping_profiles } = await api(
    "/admin/shipping-profiles?limit=1",
    { token }
  )
  const shippingProfileId = shipping_profiles[0]?.id
  if (!shippingProfileId) {
    throw new Error(
      "No shipping profile found — run the main seed at least once first."
    )
  }

  // Compare with accents stripped: production may still have the category
  // names from before the accent fixes (e.g. "Joyeria" instead of
  // "Joyería"), so an exact match would wrongly fail there.
  const normalize = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

  const wantedCategories = [...new Set(NEW_PRODUCTS.map((p) => p.category))]
  const { product_categories: allCategories } = await api(
    "/admin/product-categories?limit=100",
    { token }
  )
  const categoryIdByName = {}
  for (const name of wantedCategories) {
    const match = allCategories.find((c) => normalize(c.name) === normalize(name))
    if (!match) {
      throw new Error(
        `Category "${name}" not found — it must already exist (created by seed-luxury-catalog.ts).`
      )
    }
    categoryIdByName[name] = match.id
  }

  const { stock_locations } = await api("/admin/stock-locations?limit=1", {
    token,
  })
  const stockLocationId = stock_locations[0]?.id
  if (!stockLocationId) {
    throw new Error("No stock location found — run the main seed at least once first.")
  }

  console.log("Resolved:")
  console.log("  sales channel:", defaultSalesChannelId)
  console.log("  shipping profile:", shippingProfileId)
  console.log("  stock location:", stockLocationId)
  console.log("  categories:", categoryIdByName)

  if (DRY_RUN) {
    console.log("\nDRY_RUN=1 set — not creating anything. Exiting.")
    return
  }

  const created = []

  for (const p of NEW_PRODUCTS) {
    const [axisA, axisB] = p.axes
    const variants = axisA.values.flatMap((a) =>
      axisB.values.map((b) => ({
        title: `${a} / ${b}`,
        sku: `${p.handle}-${a}-${b}`.toUpperCase().replace(/[^A-Z0-9]+/g, "-"),
        options: { [axisA.title]: a, [axisB.title]: b },
        prices: [
          { amount: p.priceMxn, currency_code: "mxn" },
          { amount: p.priceUsd, currency_code: "usd" },
        ],
        manage_inventory: true,
      }))
    )

    console.log(`\nCreating "${p.title}"...`)
    const { product } = await api("/admin/products", {
      method: "POST",
      token,
      body: {
        title: p.title,
        categories: [{ id: categoryIdByName[p.category] }],
        description: p.description,
        handle: p.handle,
        status: "published",
        shipping_profile_id: shippingProfileId,
        images: [{ url: p.image }],
        thumbnail: p.image,
        options: [
          { title: axisA.title, values: axisA.values },
          { title: axisB.title, values: axisB.values },
        ],
        variants,
        sales_channels: [{ id: defaultSalesChannelId }],
      },
    })

    // Stock inventory items are created asynchronously by the product-create
    // workflow; fetch them back by SKU so we can set a stock level for each.
    const { variants: createdVariants } = await api(
      `/admin/products/${product.id}/variants?fields=id,sku,*inventory_items.inventory`,
      { token }
    )

    for (const variant of createdVariants) {
      const inventoryItemId = variant.inventory_items?.[0]?.inventory?.id
      if (!inventoryItemId) continue
      await api(`/admin/inventory-items/${inventoryItemId}/location-levels`, {
        method: "POST",
        token,
        body: { location_id: stockLocationId, stocked_quantity: 100 },
      })
    }

    console.log(`  created: ${product.id} (${product.handle})`)
    created.push({ title: p.title, category: p.category, priceMxn: p.priceMxn, handle: p.handle })
  }

  console.log("\nDone. Created products:")
  console.table(created)
}

main().catch((err) => {
  console.error("\nFailed:", err.message)
  process.exit(1)
})
