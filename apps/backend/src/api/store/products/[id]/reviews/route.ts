import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { REVIEW_MODULE } from "../../../../../modules/review"
import type ReviewModuleService from "../../../../../modules/review/service"
import { getRequestIp, isRateLimited } from "../../../../../utils/rate-limit"
import { createReviewWorkflow } from "../../../../../workflows/create-review"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const reviewModuleService: ReviewModuleService = req.scope.resolve(
    REVIEW_MODULE
  )

  const reviews = await reviewModuleService.listReviews(
    { product_id: req.params.id },
    { order: { created_at: "DESC" } }
  )

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  res.json({
    reviews,
    average: Math.round(average * 10) / 10,
    count: reviews.length,
  })
}

const CreateReviewSchema = z.object({
  author_name: z.string().trim().min(1).max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(1000),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const key = `review:${getRequestIp(req)}`
  if (isRateLimited(key, { limit: 5, windowMs: 60_000 })) {
    res.status(429).json({ message: "Demasiados intentos. Espera un minuto e intenta de nuevo." })
    return
  }

  const parsed = CreateReviewSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ message: "Datos de resena invalidos" })
    return
  }

  const { result: review } = await createReviewWorkflow(req.scope).run({
    input: {
      product_id: req.params.id,
      author_name: parsed.data.author_name,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  })

  res.status(201).json({ review })
}
