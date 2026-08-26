const STEPS = ["Envio", "Pago", "Confirmacion"] as const

export function CheckoutProgress({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="flex items-center gap-3 text-sm">
      {STEPS.map((step, index) => (
        <li key={step} className="flex items-center gap-3">
          <span
            className={`flex items-center gap-2 ${
              index <= current ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <span
              className={`flex size-6 items-center justify-center rounded-full border text-xs ${
                index <= current
                  ? "border-foreground bg-foreground text-background"
                  : "border-border"
              }`}
            >
              {index + 1}
            </span>
            {step}
          </span>
          {index < STEPS.length - 1 ? (
            <span className="h-px w-8 bg-border" aria-hidden />
          ) : null}
        </li>
      ))}
    </ol>
  )
}
