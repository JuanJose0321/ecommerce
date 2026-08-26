"use client"

import { useCallback, useMemo, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { formatPrice } from "@/lib/format"
import { colorToHex } from "@/lib/colors"
import type { MedusaCategory } from "@/lib/medusa"

type Props = {
  categories: MedusaCategory[]
  colors: string[]
  materials: string[]
  priceBounds: { min: number; max: number }
}

const SORT_OPTIONS = [
  { value: "popular", label: "Popularidad" },
  { value: "newest", label: "Novedad" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
] as const

export function CatalogFilters({
  categories,
  colors,
  materials,
  priceBounds,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeCategory = searchParams.get("category") ?? ""
  const activeColor = searchParams.get("color") ?? ""
  const activeMaterial = searchParams.get("material") ?? ""
  const activeSort = searchParams.get("sort") ?? "popular"

  const [priceRange, setPriceRange] = useState<[number, number]>([
    searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : priceBounds.min,
    searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : priceBounds.max,
  ])

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      const query = params.toString()
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        })
      })
    },
    [pathname, router, searchParams]
  )

  const toggleValue = (key: string, value: string, active: string) =>
    updateParams({ [key]: active === value ? null : value })

  const priceLabel = useMemo(
    () =>
      `${formatPrice(priceRange[0], "mxn")} — ${formatPrice(priceRange[1], "mxn")}`,
    [priceRange]
  )

  return (
    <div
      className={`space-y-8 transition-opacity duration-200 ${
        isPending ? "opacity-60" : "opacity-100"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <FilterPill
            label="Todo"
            active={activeCategory === ""}
            onClick={() => updateParams({ category: null })}
          />
          {categories.map((cat) => (
            <FilterPill
              key={cat.id}
              label={cat.name}
              active={activeCategory === cat.handle}
              onClick={() => toggleValue("category", cat.handle, activeCategory)}
            />
          ))}
        </div>

        <Select
          value={activeSort}
          onValueChange={(value) => updateParams({ sort: value })}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-start gap-x-12 gap-y-6">
        {colors.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Color
            </p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleValue("color", color, activeColor)}
                  title={color}
                  aria-pressed={activeColor === color}
                  aria-label={`Color ${color}`}
                  className={`h-7 w-7 rounded-full border transition-shadow ${
                    activeColor === color
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: colorToHex(color) }}
                />
              ))}
            </div>
          </div>
        ) : null}

        {materials.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Material
            </p>
            <div className="flex flex-wrap gap-2">
              {materials.map((material) => (
                <FilterPill
                  key={material}
                  label={material}
                  active={activeMaterial === material}
                  onClick={() =>
                    toggleValue("material", material, activeMaterial)
                  }
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="min-w-56 space-y-3">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            Precio: {priceLabel}
          </p>
          <Slider
            value={priceRange}
            min={priceBounds.min}
            max={priceBounds.max}
            step={Math.max(1, Math.round((priceBounds.max - priceBounds.min) / 50))}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            onValueCommitted={(value) => {
              const [minPrice, maxPrice] = value as [number, number]
              updateParams({
                minPrice: String(minPrice),
                maxPrice: String(maxPrice),
              })
            }}
          />
        </div>
      </div>
    </div>
  )
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-foreground hover:border-foreground"
      }`}
    >
      {label}
    </button>
  )
}
