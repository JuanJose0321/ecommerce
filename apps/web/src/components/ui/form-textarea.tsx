"use client"

import { forwardRef, useId, useState } from "react"

import { FieldMessage } from "@/components/ui/field-message"
import { cn } from "@/lib/utils"

type FormTextareaProps = {
  label: string
  error?: string | null
  hint?: string
  containerClassName?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(function FormTextarea(
  { label, error, hint, id, className, containerClassName, onFocus, onBlur, ...props },
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
      <textarea
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
          "w-full resize-none rounded-md border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none transition-shadow duration-200 placeholder:text-muted-foreground/60",
          error ? "border-destructive" : focused ? "border-foreground shadow-[0_0_0_3px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]" : "border-border",
          className
        )}
        {...props}
      />
      <FieldMessage id={fieldId} error={error} hint={hint} />
    </div>
  )
})
