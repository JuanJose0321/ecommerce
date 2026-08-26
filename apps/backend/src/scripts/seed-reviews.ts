import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { REVIEW_MODULE } from "../modules/review"
import type ReviewModuleService from "../modules/review/service"

const REVIEWS_BY_HANDLE: Record<
  string,
  { author_name: string; rating: number; comment: string }[]
> = {
  "reloj-solstice-field": [
    {
      author_name: "Marcela T.",
      rating: 5,
      comment: "El acabado mate de la esfera es espectacular y la correa de piel se siente de calidad real.",
    },
    {
      author_name: "Diego R.",
      rating: 4,
      comment: "Muy elegante, el broche podria ser un poco mas robusto pero en general encantado.",
    },
  ],
  "reloj-explorer-untamed": [
    {
      author_name: "Fernanda L.",
      rating: 5,
      comment: "Lo uso a diario, resistente y se ve espectacular con la correa NATO verde.",
    },
  ],
  "brazalete-infinity-rose": [
    {
      author_name: "Sofia M.",
      rating: 5,
      comment: "Regalo perfecto, el empaque y el brillo del oro rosa superaron mis expectativas.",
    },
    {
      author_name: "Carla P.",
      rating: 5,
      comment: "Se ve incluso mejor en persona que en las fotos.",
    },
  ],
  "collar-perlas-cascade": [
    {
      author_name: "Renata G.",
      rating: 4,
      comment: "Hermoso collar, las perlas tienen un brillo muy uniforme.",
    },
  ],
  "abrigo-bomber-camel": [
    {
      author_name: "Luis A.",
      rating: 5,
      comment: "La piel se siente premium y el corte camel combina con todo.",
    },
    {
      author_name: "Andrea V.",
      rating: 4,
      comment: "Talla un poco grande, pedi una talla menos de lo usual y quedo perfecto.",
    },
  ],
  "auriculares-aria-pro": [
    {
      author_name: "Jorge N.",
      rating: 5,
      comment: "Cancelacion de ruido excelente y el acabado en aluminio se ve carisimo.",
    },
    {
      author_name: "Paola S.",
      rating: 4,
      comment: "Suenan muy bien, la bateria podria durar un poco mas.",
    },
  ],
}

export default async function seedReviews({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const reviewModuleService: ReviewModuleService =
    container.resolve(REVIEW_MODULE)

  const handles = Object.keys(REVIEWS_BY_HANDLE)
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: handles },
  })

  const input = products.flatMap((product) =>
    (REVIEWS_BY_HANDLE[product.handle] ?? []).map((review) => ({
      product_id: product.id,
      ...review,
    }))
  )

  if (input.length === 0) {
    logger.info("No matching products found for review seed. Skipping.")
    return
  }

  await reviewModuleService.createReviews(input)
  logger.info(`Seeded ${input.length} reviews across ${products.length} products.`)
}
