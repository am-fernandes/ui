import { cn } from "@/lib/utils"
import * as React from "react"

export interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Time as "HH:MM" 24-hour string (e.g. "14:30"). */
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, lang = "pt-BR", step = 60, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="time"
        lang={lang}
        step={step}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        {...props}
      />
    )
  },
)
TimePicker.displayName = "TimePicker"

export { TimePicker }
