import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"

const DEMO_PRODUCT_HANDLES = ["t-shirt", "sweatshirt", "sweatpants", "shorts"]

type VariantAxis = { title: string; values: string[] }

type ProductSeed = {
  title: string
  category: string
  description: string
  handle: string
  image: string
  axes: [VariantAxis, VariantAxis]
  priceMxn: number
  priceUsd: number
}

const CATEGORIES = ["Relojes", "Joyería", "Moda", "Tecnología"] as const

const PRODUCTS: ProductSeed[] = [
  {
    title: "Reloj de Bolsillo Heritage",
    category: "Relojes",
    description:
      "Reloj de bolsillo de manufactura clásica, caja grabada a mano y movimiento mecánico de cuerda. Una pieza de colección para quien valora la relojería tradicional.",
    handle: "reloj-bolsillo-heritage",
    image:
      "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=1200&q=80",
    axes: [
      { title: "Material", values: ["Plata Envejecida", "Oro Viejo"] },
      { title: "Cadena", values: ["Corta", "Larga"] },
    ],
    priceMxn: 38900,
    priceUsd: 2150,
  },
  {
    title: "Reloj Solstice Field",
    category: "Relojes",
    description:
      "Reloj de campo minimalista con esfera mate y correa de piel curtida vegetal. Diseñado para el uso diario sin sacrificar precisión suiza.",
    handle: "reloj-solstice-field",
    image:
      "https://images.unsplash.com/photo-1495856458515-0637185db551?w=1200&q=80",
    axes: [
      { title: "Material", values: ["Acero Cepillado", "Titanio"] },
      { title: "Correa", values: ["Piel Cognac", "Piel Negra"] },
    ],
    priceMxn: 24500,
    priceUsd: 1350,
  },
  {
    title: "Reloj Explorer Untamed",
    category: "Relojes",
    description:
      "Reloj deportivo resistente al agua con bisel bidireccional y correa NATO. Construido para la aventura sin perder elegancia.",
    handle: "reloj-explorer-untamed",
    image:
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=1200&q=80",
    axes: [
      { title: "Color", values: ["Verde Bosque", "Negro Onix"] },
      { title: "Correa", values: ["NATO Textil", "Caucho"] },
    ],
    priceMxn: 29800,
    priceUsd: 1640,
  },
  {
    title: "Brazalete Infinity Rose",
    category: "Joyería",
    description:
      "Brazalete de oro rosa con pave de diamantes en patrón infinito. Engastado a mano por maestros joyeros.",
    handle: "brazalete-infinity-rose",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80",
    axes: [
      { title: "Metal", values: ["Oro Rosa 18k", "Oro Blanco 18k"] },
      { title: "Acabado", values: ["Pulido", "Mate"] },
    ],
    priceMxn: 56000,
    priceUsd: 3100,
  },
  {
    title: "Collar de Perlas Cascade",
    category: "Joyería",
    description:
      "Collar de perlas cultivadas de agua dulce con broche de plata de ley. Presentado en estuche de terciopelo.",
    handle: "collar-perlas-cascade",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80",
    axes: [
      { title: "Largo", values: ["40 cm", "45 cm"] },
      { title: "Broche", values: ["Plata", "Oro Vermeil"] },
    ],
    priceMxn: 18900,
    priceUsd: 1040,
  },
  {
    title: "Colgante Dueto Celeste",
    category: "Joyería",
    description:
      "Colgante doble con piedra facetada azul y luna creciente incrustada de circonias. Cadena de oro de 14k ajustable.",
    handle: "colgante-dueto-celeste",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80",
    axes: [
      { title: "Metal", values: ["Oro Amarillo", "Oro Blanco"] },
      { title: "Piedra", values: ["Topacio Azul", "Amatista"] },
    ],
    priceMxn: 15400,
    priceUsd: 850,
  },
  {
    title: "Abrigo Bomber Camel",
    category: "Moda",
    description:
      "Abrigo bomber en piel vuelta color camel, forro interior acolchado y herrajes metálicos mate.",
    handle: "abrigo-bomber-camel",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80",
    axes: [
      { title: "Talla", values: ["S", "M", "L"] },
      { title: "Color", values: ["Camel", "Negro"] },
    ],
    priceMxn: 21900,
    priceUsd: 1210,
  },
  {
    title: "Vestido Midi Bordeaux",
    category: "Moda",
    description:
      "Vestido midi en gabardina de algodón con botonadura frontal en madreperla. Silueta entallada con falda en A.",
    handle: "vestido-midi-bordeaux",
    image:
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=1200&q=80",
    axes: [
      { title: "Talla", values: ["XS", "S", "M"] },
      { title: "Color", values: ["Bordeaux", "Negro"] },
    ],
    priceMxn: 12800,
    priceUsd: 705,
  },
  {
    title: "Oxford Suede Emeraude",
    category: "Moda",
    description:
      "Zapato Oxford en gamuza esmeralda con suela de cuero cosida a mano. Un statement piece para el guardarropa formal.",
    handle: "oxford-suede-emeraude",
    image:
      "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=1200&q=80",
    axes: [
      { title: "Talla", values: ["26", "27", "28"] },
      { title: "Suela", values: ["Cuero", "Goma"] },
    ],
    priceMxn: 8900,
    priceUsd: 490,
  },
  {
    title: "Auriculares Aria Pro",
    category: "Tecnología",
    description:
      "Auriculares premium con cancelación activa de ruido, drivers de titanio y carcasa de aluminio anodizado.",
    handle: "auriculares-aria-pro",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
    axes: [
      { title: "Color", values: ["Grafito", "Champan"] },
      { title: "Edición", values: ["Estándar", "Titanio"] },
    ],
    priceMxn: 9800,
    priceUsd: 540,
  },
  {
    title: "Reloj Inteligente Horizon",
    category: "Tecnología",
    description:
      "Smartwatch de lujo con caja de titanio cepillado, cristal de zafiro y correa intercambiable. Monitoreo de salud y GPS integrado.",
    handle: "reloj-inteligente-horizon",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
    axes: [
      { title: "Material", values: ["Titanio", "Acero"] },
      { title: "Correa", values: ["Piel", "Milanesa"] },
    ],
    priceMxn: 13500,
    priceUsd: 745,
  },
  {
    title: "Cámara Instant Atelier",
    category: "Tecnología",
    description:
      "Cámara instantánea de edición limitada con cuerpo en aluminio cepillado y lente de vidrio multicapa.",
    handle: "camara-instant-atelier",
    image:
      "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=1200&q=80",
    axes: [
      { title: "Color", values: ["Negro Onix", "Blanco Perla"] },
      { title: "Edición", values: ["Estándar", "Coleccionista"] },
    ],
    priceMxn: 6900,
    priceUsd: 380,
  },
  {
    title: "Reloj Minimalista Nocturne",
    category: "Relojes",
    description:
      "Reloj de esfera negra mate con bisel delgado y correa de malla milanesa. Diseño depurado para el día a día sin perder carácter.",
    handle: "reloj-minimalista-nocturne",
    image:
      "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=1200&q=80",
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
    image:
      "https://images.unsplash.com/photo-1645961855223-f5b203e47f2f?w=1200&q=80",
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
    image:
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=1200&q=80",
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
    image:
      "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=1200&q=80",
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
    image:
      "https://images.unsplash.com/photo-1585412459212-8def26f7e84c?w=1200&q=80",
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
    image:
      "https://images.unsplash.com/photo-1777987601677-3059be0e1388?w=1200&q=80",
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
    image:
      "https://images.unsplash.com/photo-1675319245480-215961c129f1?w=1200&q=80",
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
    image:
      "https://images.unsplash.com/photo-1520549233664-03f65c1d1327?w=1200&q=80",
    axes: [
      { title: "Color", values: ["Champan", "Grafito"] },
      { title: "Edición", values: ["Estándar", "Coleccionista"] },
    ],
    priceMxn: 11500,
    priceUsd: 635,
  },
]

export default async function seedLuxuryCatalog({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

  const { data: storeResult } = await query.graph({
    entity: "store",
    fields: ["id", "default_sales_channel_id"],
  })
  const defaultSalesChannelId = storeResult[0].default_sales_channel_id!

  logger.info("Seeding Mexico region...")
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "México",
          currency_code: "mxn",
          countries: ["mx"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  })
  const region = regionResult[0]

  await createTaxRegionsWorkflow(container).run({
    input: [{ country_code: "mx", provider_id: "tp_system" }],
  })
  logger.info("Finished seeding Mexico region.")

  logger.info("Seeding Mexico stock location...")
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Bodega CDMX",
          address: {
            city: "Ciudad de México",
            country_code: "MX",
            address_1: "",
          },
        },
      ],
    },
  })
  const stockLocation = stockLocationResult[0]

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  })

  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfile = shippingProfileResult[0]

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Entrega México",
    type: "shipping",
    service_zones: [
      {
        name: "México",
        geo_zones: [{ country_code: "mx", type: "country" }],
      },
    ],
  })

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  })

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Envío Estándar",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Estándar",
          description: "Entrega en 3-5 días hábiles.",
          code: "standard",
        },
        prices: [
          { currency_code: "mxn", amount: 199 },
          { region_id: region.id, amount: 199 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "Envío Express",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Entrega en 24-48 horas.",
          code: "express",
        },
        prices: [
          { currency_code: "mxn", amount: 349 },
          { region_id: region.id, amount: 349 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  })

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: [defaultSalesChannelId] },
  })
  logger.info("Finished seeding Mexico stock location.")

  logger.info("Seeding luxury catalog...")

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: CATEGORIES.map((name) => ({
        name,
        is_active: true,
      })),
    },
  })

  const productsInput = PRODUCTS.map((p) => {
    const [axisA, axisB] = p.axes
    const variants = axisA.values.flatMap((a) =>
      axisB.values.map((b) => ({
        title: `${a} / ${b}`,
        sku: `${p.handle}-${a}-${b}`
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "-"),
        options: { [axisA.title]: a, [axisB.title]: b },
        prices: [
          { amount: p.priceMxn, currency_code: "mxn" },
          { amount: p.priceUsd, currency_code: "usd" },
        ],
      }))
    )

    return {
      title: p.title,
      category_ids: [categoryResult.find((c) => c.name === p.category)!.id],
      description: p.description,
      handle: p.handle,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [{ url: p.image }],
      thumbnail: p.image,
      options: [
        { title: axisA.title, values: axisA.values },
        { title: axisB.title, values: axisB.values },
      ],
      variants,
      sales_channels: [{ id: defaultSalesChannelId }],
    }
  })

  await createProductsWorkflow(container).run({
    input: { products: productsInput },
  })
  logger.info("Finished seeding luxury catalog.")

  logger.info("Unpublishing generic demo products...")
  const { data: demoProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: DEMO_PRODUCT_HANDLES },
  })

  if (demoProducts.length > 0) {
    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: demoProducts.map((p) => p.id) },
        update: { status: ProductStatus.DRAFT },
      },
    })
  }
  logger.info("Finished unpublishing generic demo products.")

  logger.info("Seeding inventory levels for luxury catalog...")
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  })

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 100,
        inventory_item_id: item.id,
      })),
    },
  })
  logger.info("Finished seeding inventory levels.")
}
