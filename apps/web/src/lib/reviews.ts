const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export type ProductReview = {
  id: string
  author_name: string
  rating: number
  comment: string
  created_at: string
}

export type ReviewSummary = {
  reviews: ProductReview[]
  average: number
  count: number
}

function authHeaders() {
  if (!MEDUSA_PUBLISHABLE_KEY) {
    throw new Error(
      "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY no esta configurada. Revisa apps/web/.env.local."
    )
  }
  return { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY }
}

export async function getProductReviews(
  productId: string
): Promise<ReviewSummary> {
  const res = await fetch(
    `${MEDUSA_BACKEND_URL}/store/products/${productId}/reviews`,
    {
      headers: authHeaders(),
      next: { revalidate: 60, tags: ["reviews", `reviews:${productId}`] },
    }
  )

  if (!res.ok) {
    return { reviews: [], average: 0, count: 0 }
  }

  return res.json()
}

export async function getReviewSummaries(
  productIds: string[]
): Promise<Record<string, { average: number; count: number }>> {
  const entries = await Promise.all(
    productIds.map(async (id) => {
      const summary = await getProductReviews(id)
      return [id, { average: summary.average, count: summary.count }] as const
    })
  )

  return Object.fromEntries(entries)
}

export type CreateReviewInput = {
  author_name: string
  rating: number
  comment: string
}

export async function submitReview(
  productId: string,
  input: CreateReviewInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await fetch(
    `${MEDUSA_BACKEND_URL}/store/products/${productId}/reviews`,
    {
      method: "POST",
      headers: {
        ...authHeaders(),
        "content-type": "application/json",
      },
      body: JSON.stringify(input),
    }
  )

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    return { ok: false, message: data?.message ?? "No se pudo enviar la reseña." }
  }

  return { ok: true }
}
