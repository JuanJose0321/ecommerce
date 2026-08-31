"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { MedusaCategory } from "@/lib/medusa"

export function MobileNav({ categories }: { categories: MedusaCategory[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Abrir menu"
        className="flex items-center justify-center rounded-full p-2 transition-[background-color,transform] duration-200 hover:bg-muted active:scale-90 lg:hidden"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl tracking-wide uppercase">
            Maison Luxe
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 pb-6">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-2.5 text-sm transition-colors hover:bg-muted"
          >
            Todo el catalogo
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.handle}`}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-sm transition-colors hover:bg-muted"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
