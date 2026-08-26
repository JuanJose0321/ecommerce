"use client"

import { useState } from "react"
import { Star } from "lucide-react"

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const display = hovered ?? value

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Calificacion">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1
        const filled = starValue <= display
        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} de 5 estrellas`}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(null)}
            className="p-0.5"
          >
            <Star
              className={filled ? "size-6 fill-foreground text-foreground" : "size-6 text-muted-foreground/40"}
            />
          </button>
        )
      })}
    </div>
  )
}
