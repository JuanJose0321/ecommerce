import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentCustomer } from "@/lib/auth"
import { logoutAction } from "@/app/actions/auth"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default async function AccountDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const customer = await getCurrentCustomer()
  if (!customer) redirect("/account/login")

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Mi cuenta" }]} />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
          <AccountNavLink href="/account">Resumen</AccountNavLink>
          <AccountNavLink href="/account/orders">Mis ordenes</AccountNavLink>
          <AccountNavLink href="/account/addresses">Direcciones</AccountNavLink>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Cerrar sesion
            </button>
          </form>
        </nav>

        <div>{children}</div>
      </div>
    </div>
  )
}

function AccountNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </Link>
  )
}
