import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getOrder } from "@/lib/checkout"
import { formatPrice } from "@/lib/format"

export default async function OrderConfirmationPage({
  params,
}: PageProps<"/checkout/confirmacion/[orderId]">) {
  const { orderId } = await params
  const order = await getOrder(orderId)

  if (!order) notFound()

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-10">
      <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
        Gracias por tu compra
      </p>
      <h1 className="font-heading mt-3 text-3xl sm:text-4xl">
        Orden #{order.display_id} confirmada
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enviamos los detalles a {order.email}.
      </p>

      <div className="mt-10 space-y-4 border border-border p-6 text-left">
        <ul className="space-y-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden bg-muted">
                {item.thumbnail ? (
                  <Image src={item.thumbnail} alt={item.title} fill sizes="64px" className="object-cover" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-border pt-4 text-base font-medium">
          <span>Total</span>
          <span>{formatPrice(order.total, order.currency_code)}</span>
        </div>
      </div>

      <Link
        href="/"
        className="mt-10 inline-block rounded-full border border-border px-6 py-2.5 text-sm transition-colors hover:border-foreground"
      >
        Seguir explorando
      </Link>
    </div>
  )
}
