"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"

import { StarRating } from "@/components/star-rating"
import { StarRatingInput } from "@/components/star-rating-input"
import { AnimatedForm } from "@/components/ui/animated-form"
import { AnimatePresence, FormBanner } from "@/components/ui/form-banner"
import { FormField } from "@/components/ui/form-field"
import { FormTextarea } from "@/components/ui/form-textarea"
import { SubmitButton } from "@/components/ui/submit-button"
import { submitReview, type ProductReview } from "@/lib/reviews"

export function ReviewsSection({
  productId,
  initialReviews,
}: {
  productId: string
  initialReviews: ProductReview[]
}) {
  const [reviews, setReviews] = useState(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [authorName, setAuthorName] = useState("")
  const [rating, setRating] = useState(0)
  const [ratingError, setRatingError] = useState<string | null>(null)
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
      setRatingError("Selecciona una calificacion.")
      return
    }
    setRatingError(null)
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
        <motion.button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="rounded-full border border-border px-4 py-1.5 text-sm transition-colors duration-200 hover:border-foreground"
        >
          {showForm ? "Cancelar" : "Escribir resena"}
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {showForm ? (
          <AnimatedForm
            key="review-form"
            onSubmit={handleSubmit}
            className="max-w-md space-y-5 rounded-lg border border-border p-6"
          >
            <FormField
              label="Tu nombre"
              required
              maxLength={80}
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Calificacion
              </label>
              <StarRatingInput
                value={rating}
                onChange={(v) => {
                  setRating(v)
                  if (ratingError) setRatingError(null)
                }}
              />
              <AnimatePresence mode="wait" initial={false}>
                {ratingError ? (
                  <motion.p
                    key="rating-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0, x: [0, -3, 3, -2, 2, 0] }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="text-xs text-destructive"
                  >
                    {ratingError}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
            <FormTextarea
              label="Comentario"
              required
              maxLength={1000}
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <AnimatePresence mode="wait" initial={false}>
              {error ? (
                <FormBanner key="form-error" type="error">
                  {error}
                </FormBanner>
              ) : null}
            </AnimatePresence>

            <SubmitButton loading={status === "submitting"} loadingText="Enviando...">
              Enviar resena
            </SubmitButton>
          </AnimatedForm>
        ) : null}
      </AnimatePresence>

      {reviews.length > 0 ? (
        <ul className="space-y-6">
          <AnimatePresence initial={false}>
            {reviews.map((review) => (
              <motion.li
                key={review.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-1.5 border-b border-border pb-6"
              >
                <StarRating value={review.rating} size={13} />
                <p className="text-sm font-medium">{review.author_name}</p>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : null}
    </section>
  )
}
