"use client"

import { useId, useMemo, useState } from "react"
import { StarRating } from "@/components/star-rating"
import { StarRatingInput } from "@/components/star-rating-input"
import { submitReview, type ProductReview } from "@/lib/reviews"

export function ReviewsSection({
  productId,
  initialReviews,
}: {
  productId: string
  initialReviews: ProductReview[]
}) {
  const authorNameId = useId()
  const commentId = useId()
  const [reviews, setReviews] = useState(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [authorName, setAuthorName] = useState("")
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const average = useMemo(() => {
    if (reviews.length === 0) return 0
    return (
      Math.round(
        (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
      ) / 10
    )
  }, [reviews])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError("Selecciona una calificacion.")
      return
    }
    setStatus("submitting")
    setError(null)

    const result = await submitReview(productId, {
      author_name: authorName,
      rating,
      comment,
    })

    if (!result.ok) {
      setStatus("error")
      setError(result.message)
      return
    }

    setReviews((prev) => [
      {
        id: crypto.randomUUID(),
        author_name: authorName,
        rating,
        comment,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ])
    setAuthorName("")
    setRating(0)
    setComment("")
    setShowForm(false)
    setStatus("idle")
  }

  return (
    <section className="space-y-8 border-t border-border pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl">Resenas</h2>
          {reviews.length > 0 ? (
            <div className="mt-1">
              <StarRating value={average} count={reviews.length} />
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Aun no hay resenas para este producto.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:border-foreground"
        >
          {showForm ? "Cancelar" : "Escribir resena"}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="max-w-md space-y-4 border border-border p-5">
          <div className="space-y-1.5">
            <label htmlFor={authorNameId} className="text-xs tracking-wide text-muted-foreground uppercase">
              Tu nombre
            </label>
            <input
              id={authorNameId}
              required
              maxLength={80}
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs tracking-wide text-muted-foreground uppercase">
              Calificacion
            </label>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor={commentId} className="text-xs tracking-wide text-muted-foreground uppercase">
              Comentario
            </label>
            <textarea
              id={commentId}
              required
              maxLength={1000}
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full resize-none border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {status === "submitting" ? "Enviando..." : "Enviar resena"}
          </button>
        </form>
      ) : null}

      {reviews.length > 0 ? (
        <ul className="space-y-6">
          {reviews.map((review) => (
            <li key={review.id} className="space-y-1.5 border-b border-border pb-6">
              <StarRating value={review.rating} size={13} />
              <p className="text-sm font-medium">{review.author_name}</p>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
