"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { toast } from "sonner"
import { motion } from "framer-motion"

import { getStripe } from "@/lib/stripe-client"
import { initiatePaymentAction, completeOrderAction } from "@/app/actions/checkout"
import { formatPrice } from "@/lib/format"
import { AnimatedForm, FormFade } from "@/components/ui/animated-form"
import { AnimatePresence, FormBanner } from "@/components/ui/form-banner"
import { SubmitButton } from "@/components/ui/submit-button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Cart } from "@/lib/cart"

const OXXO_LIMIT_MXN = 10000

type PaymentProvider = "pp_stripe_stripe" | "pp_stripe-oxxo_stripe"

export function PaymentStep({ cart, onBack }: { cart: Cart; onBack: () => void }) {
  const [provider, setProvider] = useState<PaymentProvider>("pp_stripe_stripe")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const oxxoAvailable = cart.currency_code === "mxn" && cart.total <= OXXO_LIMIT_MXN

  useEffect(() => {
    // Creating a Stripe payment session is a real network call to an external
    // system (Medusa -> Stripe), so it has to run as an effect keyed on the
    // selected provider, not be derived during render.
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setClientSecret(null)
    setError(null)

    initiatePaymentAction(provider).then((result) => {
      if (cancelled) return
      if (result.ok) {
        setClientSecret(result.clientSecret)
      } else {
        setError(result.message)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [provider])

  return (
    <FormFade className="space-y-6">
      <h2 className="font-heading text-xl">Pago</h2>

      <div className="flex gap-2">
        <PaymentMethodPill
          active={provider === "pp_stripe_stripe"}
          onClick={() => setProvider("pp_stripe_stripe")}
        >
          Tarjeta
        </PaymentMethodPill>
        <PaymentMethodPill
          active={provider === "pp_stripe-oxxo_stripe"}
          onClick={() => oxxoAvailable && setProvider("pp_stripe-oxxo_stripe")}
          disabled={!oxxoAvailable}
        >
          OXXO
        </PaymentMethodPill>
      </div>
      {!oxxoAvailable ? (
        <p className="text-xs text-muted-foreground">
          OXXO no esta disponible para compras mayores a {formatPrice(OXXO_LIMIT_MXN, "mxn")}.
        </p>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="status"
            aria-label="Cargando formulario de pago"
          >
            <PaymentElementSkeleton />
          </motion.div>
        ) : error && !clientSecret ? (
          <FormBanner key="init-error" type="error">
            {error}
          </FormBanner>
        ) : clientSecret ? (
          <motion.div key="elements" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
            <Elements
              stripe={getStripe()}
              options={{ clientSecret, appearance: { theme: "stripe" } }}
            >
              <StripeCheckoutForm provider={provider} onBack={onBack} />
            </Elements>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-200 hover:text-foreground"
      >
        Volver a envio
      </button>
    </FormFade>
  )
}

function PaymentElementSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-11 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
  )
}

function PaymentMethodPill({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-foreground hover:border-foreground"
      }`}
    >
      {children}
    </motion.button>
  )
}

function StripeCheckoutForm({
  provider,
  onBack,
}: {
  provider: PaymentProvider
  onBack: () => void
}) {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voucherUrl, setVoucherUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message ?? "Revisa los datos de pago.")
        setSubmitting(false)
        return
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
        },
        redirect: "if_required",
      })

      if (confirmError) {
        const message =
          confirmError.message ??
          "Tu pago fue rechazado. Verifica los datos o intenta con otro metodo."
        setError(message)
        toast.error(message)
        setSubmitting(false)
        return
      }

      // OXXO never authorizes synchronously: confirming just generates the
      // voucher (status "requires_action"). The order is only created once
      // Stripe's webhook reports the voucher was actually paid (Medusa's core
      // payment-webhook subscriber completes the cart at that point) - trying
      // to complete the cart now would fail with "not authorized with the
      // provider", so we show the voucher instead of calling completeOrderAction.
      if (provider === "pp_stripe-oxxo_stripe") {
        const oxxoVoucherUrl =
          // @ts-expect-error -- oxxo_display_details is not in the base PaymentIntent type
          paymentIntent?.next_action?.oxxo_display_details?.hosted_voucher_url
        if (oxxoVoucherUrl) {
          setVoucherUrl(oxxoVoucherUrl)
          setSubmitting(false)
          return
        }
      }

      const result = await completeOrderAction()
      if (!result.ok) {
        setError(result.message)
        setSubmitting(false)
        return
      }

      setSucceeded(true)
      setTimeout(() => {
        router.push(`/checkout/confirmacion/${result.order.id}`)
      }, 600)
    } catch {
      const message = "Error de red. Revisa tu conexion e intenta de nuevo."
      setError(message)
      toast.error(message)
      setSubmitting(false)
    }
  }

  if (succeeded) {
    return (
      <FormFade>
        <FormBanner type="success">Pago confirmado. Redirigiendo a tu orden...</FormBanner>
      </FormFade>
    )
  }

  if (voucherUrl) {
    return (
      <FormFade className="space-y-4 rounded-lg border border-border p-6 text-center">
        <p className="font-heading text-lg">Tu voucher OXXO esta listo</p>
        <p className="text-sm text-muted-foreground">
          Paga en cualquier tienda OXXO antes de que expire. En cuanto se
          registre el pago, confirmaremos tu orden por correo.
        </p>
        <a
          href={voucherUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors duration-200 hover:bg-foreground/90"
        >
          Ver voucher para pagar
        </a>
      </FormFade>
    )
  }

  return (
    <AnimatedForm onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.div
            key="payment-error"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0, x: [0, -4, 4, -3, 3, 0] }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-2 border border-destructive/30 bg-destructive/5 p-4"
          >
            <p className="text-sm font-medium text-destructive">Pago rechazado</p>
            <p className="text-sm text-destructive">{error}</p>
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-destructive underline underline-offset-4"
            >
              Intentar con otro metodo de pago
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <SubmitButton loading={submitting} loadingText="Procesando..." disabled={!stripe} className="py-3.5">
        Pagar ahora
      </SubmitButton>
    </AnimatedForm>
  )
}
