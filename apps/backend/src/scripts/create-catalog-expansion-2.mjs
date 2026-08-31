// Standalone Admin API script — SECOND batch. Creates ONLY the 8 new
// products below (see create-catalog-expansion.mjs for the first batch).
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
//   node src/scripts/create-catalog-expansion-2.mjs
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
    title: "Reloj Diver Abyssal",
    category: "Relojes",
    description:
      "Reloj deportivo con bisel giratorio, cristal de zafiro y resistencia al agua de 200 metros. Construido para explorar sin límites.",
    handle: "reloj-diver-abyssal",
    image: "https://images.unsplash.com/photo-1638538379693-5c1114e877c1?w=1200&q=80",
    axes: [
      { title: "Material", values: ["Acero Negro", "Acero Plateado"] },
      { title: "Correa", values: ["Caucho", "Malla Milanesa"] },
    ],
    priceMxn: 27800,
    priceUsd: 1535,
  },
  {
    title: "Reloj Vintage a Cuerda",
    category: "Relojes",
    description:
      "Reloj de cuerda manual con esfera guilloché y ventana de fase lunar. Un homenaje a la relojería clásica europea.",
    handle: "reloj-vintage-a-cuerda",
    image: "https://images.unsplash.com/photo-1570610265451-06cf32c3e3e4?w=1200&q=80",
    axes: [
      { title: "Material", values: ["Oro Viejo", "Acero"] },
      { title: "Correa", values: ["Piel Cognac", "Piel Negra"] },
    ],
    priceMxn: 29500,
    priceUsd: 1630,
  },
  {
    title: "Aretes Gota Cristal",
    category: "Joyería",
    description:
      "Aretes largos con cristales facetados en tonos zafiro y perla, montados en metal bañado en rodio. Un guiño a la joyería de alfombra roja.",
    handle: "aretes-gota-cristal",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=80",
    axes: [
      { title: "Metal", values: ["Rodio", "Oro Amarillo"] },
      { title: "Largo", values: ["Corto", "Largo"] },
    ],
    priceMxn: 12800,
    priceUsd: 705,
  },
  {
    title: "Brazalete Cadena Cubana",
    category: "Joyería",
    description:
      "Brazalete de eslabones cubanos en oro de 14k, acabado pulido a espejo. Una pieza statement que se lleva sola o en capas.",
    handle: "brazalete-cadena-cubana",
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1200&q=80",
    axes: [
      { title: "Metal", values: ["Oro 14k", "Oro Blanco 14k"] },
      { title: "Talla", values: ["Chico", "Grande"] },
    ],
    priceMxn: 24500,
    priceUsd: 1355,
  },
  {
    title: "Gabardina Trench Camel",
    category: "Moda",
    description:
      "Gabardina trench en algodón impermeable con cinturón anudado y forro a cuadros. El abrigo de entretiempo que nunca pasa de moda.",
    handle: "gabardina-trench-camel",
    image: "https://images.unsplash.com/photo-1631277974569-5b571f9f5707?w=1200&q=80",
    axes: [
      { title: "Talla", values: ["S", "M", "L"] },
      { title: "Color", values: ["Camel", "Negro"] },
    ],
    priceMxn: 18500,
    priceUsd: 1020,
  },
  {
    title: "Suéter Cuello Alto Piedra",
    category: "Moda",
    description:
      "Suéter de cuello alto en mezcla de lana merino, tejido acanalado y calce relajado. Abrigo con carácter minimalista.",
    handle: "sueter-cuello-alto-piedra",
    image: "https://images.unsplash.com/photo-1602792937572-33f95be0c65c?w=1200&q=80",
    axes: [
      { title: "Talla", values: ["S", "M", "L"] },
      { title: "Color", values: ["Piedra", "Grafito"] },
    ],
    priceMxn: 6800,
    priceUsd: 375,
  },
  {
    title: "Audífonos Inalámbricos Aire",
    category: "Tecnología",
    description:
      "Audífonos inalámbricos con cancelación de ruido activa y estuche de carga en aluminio cepillado. Hasta 30 horas de batería total.",
    handle: "audifonos-inalambricos-aire",
    image: "https://images.unsplash.com/photo-1755182529034-189a6051faae?w=1200&q=80",
    axes: [
      { title: "Color", values: ["Blanco Perla", "Grafito"] },
      { title: "Edición", values: ["Estándar", "Pro"] },
    ],
    priceMxn: 5400,
    priceUsd: 300,
  },
  {
    title: "Tocadiscos Vintage Melody",
    category: "Tecnología",
    description:
      "Tocadiscos con brazo de fibra de carbono, base de madera maciza y salida Bluetooth integrada. El ritual del vinilo, con comodidades actuales.",
    handle: "tocadiscos-vintage-melody",
    image: "https://images.unsplash.com/photo-1526394931762-90052e97b376?w=1200&q=80",
    axes: [
      { title: "Color", values: ["Café", "Negro"] },
      { title: "Edición", values: ["Estándar", "Coleccionista"] },
    ],
    priceMxn: 9200,
    priceUsd: 510,
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
