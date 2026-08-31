import Image from "next/image"
import { getCustomerOrders } from "@/lib/auth"
import { formatPrice } from "@/lib/format"
import { getFulfillmentLabel, getFulfillmentTone } from "@/lib/order-status"

const TONE_CLASSES: Record<string, string> = {
  muted: "bg-muted text-muted-foreground",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400",
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
  destructive: "bg-destructive/10 text-destructive",
}

export default async function OrdersPage() {
  const orders = await getCustomerOrders()

  if (orders.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="font-heading text-2xl">Mis órdenes</h1>
        <p className="text-sm text-muted-foreground">
          Aún no has realizado ninguna compra.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Mis ordenes</h1>
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="border border-border p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-heading text-sm">Orden #{order.display_id}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${TONE_CLASSES[getFulfillmentTone(order.fulfillment_status)]}`}
              >
                {getFulfillmentLabel(order.fulfillment_status)}
              </span>
            </div>

            <div className="mt-4 flex gap-3">
              {order.items.slice(0, 4).map((item) => (
                <div key={item.id} className="relative size-14 overflow-hidden bg-muted">
                  {item.thumbnail ? (
                    <Image src={item.thumbnail} alt={item.title} fill sizes="56px" className="object-cover" />
                  ) : null}
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm font-medium">
              {formatPrice(order.total, order.currency_code)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
