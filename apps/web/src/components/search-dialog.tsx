"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Fuse from "fuse.js"
import { Search } from "lucide-react"
import { motion } from "framer-motion"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { formatPrice } from "@/lib/format"

type SearchProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  minPrice: number
  currency: string
}

export function SearchDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<SearchProduct[] | null>(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!open || fetchedRef.current) return
    fetchedRef.current = true

    fetch("/api/search-index")
      .then((res) => res.json())
      .then((data: { products: SearchProduct[] }) => setProducts(data.products))
      .catch(() => {
        fetchedRef.current = false
      })
  }, [open])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const fuse = useMemo(() => {
    if (!products) return null
    return new Fuse(products, {
      keys: ["title"],
      threshold: 0.35,
      ignoreLocation: true,
    })
  }, [products])

  const results = useMemo(() => {
    if (!fuse) return []
    if (!query.trim()) return products?.slice(0, 6) ?? []
    return fuse.search(query).slice(0, 8).map((r) => r.item)
  }, [fuse, query, products])

  const goToProduct = (handle: string) => {
    setOpen(false)
    setQuery("")
    router.push(`/products/${handle}`)
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar productos"
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:border-foreground hover:text-foreground"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Buscar</span>
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] sm:inline">
          ⌘K
        </kbd>
      </motion.button>

      <CommandDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setQuery("")
        }}
        title="Buscar productos"
        description="Busca por nombre entre relojes, joyería, moda y tecnología."
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar relojes, joyería, moda..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {products === null ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Cargando catálogo...
              </div>
            ) : (
              <>
                <CommandEmpty>Sin resultados para &quot;{query}&quot;.</CommandEmpty>
                {results.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id}
                    onSelect={() => goToProduct(product.handle)}
                    className="gap-3"
                  >
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-muted">
                      {product.thumbnail ? (
                        <Image
                          src={product.thumbnail}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="font-heading text-sm">{product.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatPrice(product.minPrice, product.currency)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
