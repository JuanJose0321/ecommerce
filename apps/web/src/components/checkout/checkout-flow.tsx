"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
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
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {step === 0 ? (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <ShippingStep
                  cart={cart}
                  shippingOptions={shippingOptions}
                  onComplete={(updated) => {
                    setCart(updated)
                    setStep(1)
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <PaymentStep cart={cart} onBack={() => setStep(0)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <OrderSummary cart={cart} onCartUpdate={setCart} showCoupon={step === 1} />
        </div>
      </div>
    </div>
  )
}
