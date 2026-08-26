import { Star } from "lucide-react"

export function StarRating({
  value,
  count,
  size = 14,
}: {
  value: number
  count?: number
  size?: number
}) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${value.toFixed(1)} de 5 estrellas`}>
      <div className="flex" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(value)
          return (
            <Star
              key={i}
              width={size}
              height={size}
              className={filled ? "fill-foreground text-foreground" : "text-muted-foreground/40"}
            />
          )
        })}
      </div>
      {typeof count === "number" ? (
        <span className="text-xs text-muted-foreground">({count})</span>
      ) : null}
    </div>
  )
}
