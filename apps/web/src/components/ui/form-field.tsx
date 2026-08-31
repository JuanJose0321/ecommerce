"use client"

import { forwardRef, useId, useState } from "react"
import { motion } from "framer-motion"

import { FieldMessage } from "@/components/ui/field-message"
import { cn } from "@/lib/utils"

type FormFieldProps = {
  label: string
  error?: string | null
  hint?: string
  containerClassName?: string
  endAdornment?: React.ReactNode
} & React.InputHTMLAttributes<HTMLInputElement>

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, error, hint, id, className, containerClassName, endAdornment, onFocus, onBlur, ...props },
  ref
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const [focused, setFocused] = useState(false)

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      <label
        htmlFor={fieldId}
        className={cn(
          "block text-[11px] font-medium tracking-[0.14em] uppercase transition-colors duration-200",
          error ? "text-destructive" : focused ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          className={cn(
            "w-full border-0 border-b border-border bg-transparent px-0.5 py-2.5 text-[15px] text-foreground outline-none transition-colors duration-200 placeholder:text-muted-foreground/60",
            endAdornment && "pr-8",
            className
          )}
          {...props}
        />
        {endAdornment ? (
          <div className="absolute inset-y-0 right-0 flex items-center">{endAdornment}</div>
        ) : null}
        <motion.span
          aria-hidden
          className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left", error ? "bg-destructive" : "bg-foreground")}
          initial={false}
          animate={{ scaleX: focused || !!error ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      </div>
      <FieldMessage id={fieldId} error={error} hint={hint} />
    </div>
  )
})
