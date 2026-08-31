import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { REVIEW_MODULE } from "../modules/review"
import type ReviewModuleService from "../modules/review/service"

// One-off cleanup for the placeholder reviews the now-removed
// seed-reviews.ts script created (author_name + comment pairs below are
// copied verbatim from that script). Matches by the exact pair so it can
// never touch a genuine customer review, even one from an author with the
// same first-name-plus-initial. Safe to run more than once — deletes
// nothing once these rows are gone.
const SEEDED_REVIEWS = [
  ["Marcela T.", "El acabado mate de la esfera es espectacular y la correa de piel se siente de calidad real."],
  ["Diego R.", "Muy elegante, el broche podria ser un poco mas robusto pero en general encantado."],
  ["Fernanda L.", "Lo uso a diario, resistente y se ve espectacular con la correa NATO verde."],
  ["Sofia M.", "Regalo perfecto, el empaque y el brillo del oro rosa superaron mis expectativas."],
  ["Carla P.", "Se ve incluso mejor en persona que en las fotos."],
  ["Renata G.", "Hermoso collar, las perlas tienen un brillo muy uniforme."],
  ["Luis A.", "La piel se siente premium y el corte camel combina con todo."],
  ["Andrea V.", "Talla un poco grande, pedi una talla menos de lo usual y quedo perfecto."],
  ["Jorge N.", "Cancelacion de ruido excelente y el acabado en aluminio se ve carisimo."],
  ["Paola S.", "Suenan muy bien, la bateria podria durar un poco mas."],
] as const

export default async function purgeSeededReviews({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const reviewModuleService: ReviewModuleService = container.resolve(REVIEW_MODULE)

  const signatures = new Set(
    SEEDED_REVIEWS.map(([author, comment]) => `${author}|${comment}`)
  )

  const reviews = await reviewModuleService.listReviews({})
  const toDelete = reviews.filter((r) =>
    signatures.has(`${r.author_name}|${r.comment}`)
  )

  if (toDelete.length === 0) {
    logger.info("No seeded placeholder reviews found. Nothing to delete.")
    return
  }

  await reviewModuleService.deleteReviews(toDelete.map((r) => r.id))
  logger.info(
    `Deleted ${toDelete.length} seeded placeholder review(s). ${reviews.length - toDelete.length} genuine review(s) left untouched.`
  )
}
