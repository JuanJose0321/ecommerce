import Link from "next/link"
import { User } from "lucide-react"
import { listCategories } from "@/lib/medusa"
import { getCurrentCustomer } from "@/lib/auth"
import { MobileNav } from "@/components/mobile-nav"
import { SearchDialog } from "@/components/search-dialog"
import { WishlistLink } from "@/components/wishlist-link"
import { CartButton } from "@/components/cart-button"
import { SiteHeaderShell } from "@/components/site-header-shell"

export async function SiteHeader() {
  const [categories, customer] = await Promise.all([
    listCategories(),
    getCurrentCustomer(),
  ])

  return (
    <SiteHeaderShell>
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
            className="relative py-1 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-foreground hover:after:scale-x-100"
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
    </SiteHeaderShell>
  )
}
