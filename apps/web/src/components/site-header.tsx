import Link from "next/link"
import { User } from "lucide-react"
import { listCategories } from "@/lib/medusa"
import { getCurrentCustomer } from "@/lib/auth"
import { MobileNav } from "@/components/mobile-nav"
import { SearchDialog } from "@/components/search-dialog"
import { WishlistLink } from "@/components/wishlist-link"
import { CartButton } from "@/components/cart-button"

export async function SiteHeader() {
  const [categories, customer] = await Promise.all([
    listCategories(),
    getCurrentCustomer(),
  ])

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 lg:px-10">
        <div className="flex items-center gap-2">
          <MobileNav categories={categories} />
          <Link
            href="/"
            className="font-heading text-xl tracking-[0.15em] uppercase sm:text-2xl"
          >
            Maison Luxe
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm tracking-wide text-muted-foreground lg:flex">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.handle}`}
              className="transition-colors hover:text-foreground"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <SearchDialog />
          <WishlistLink />
          <Link
            href={customer ? "/account" : "/account/login"}
            aria-label="Mi cuenta"
            className="flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <User className="size-5" />
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  )
}
