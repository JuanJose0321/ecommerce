"use client"

import { useState } from "react"
import { CheckoutProgress } from "@/components/checkout/checkout-progress"
import { ShippingStep } from "@/components/checkout/shipping-step"
import { PaymentStep } from "@/components/checkout/payment-step"
import { OrderSummary } from "@/components/checkout/order-summary"
import { OfflineBanner } from "@/components/checkout/offline-banner"
import type { Cart } from "@/lib/cart"
import type { ShippingOption } from "@/lib/checkout"

export function CheckoutFlow({
  initialCart,
  shippingOptions,
}: {
  initialCart: Cart
  shippingOptions: ShippingOption[]
}) {
  const [cart, setCart] = useState(initialCart)
  const [step, setStep] = useState<0 | 1>(cart.shipping_methods.length > 0 ? 1 : 0)

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
      <OfflineBanner />
      <CheckoutProgress current={step} />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          {step === 0 ? (
            <ShippingStep
              cart={cart}
              shippingOptions={shippingOptions}
              onComplete={(updated) => {
                setCart(updated)
                setStep(1)
              }}
            />
          ) : (
            <PaymentStep cart={cart} onBack={() => setStep(0)} />
          )}
        </div>

        <div>
          <OrderSummary cart={cart} onCartUpdate={setCart} showCoupon={step === 1} />
        </div>
      </div>
    </div>
  )
}
