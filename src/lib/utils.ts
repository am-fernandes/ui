import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Teach tailwind-merge the three radius levels, so `rounded-none` passed by a
// consumer replaces a component's `rounded-element` instead of piling up, and
// the control heights, so `h-8` replaces a component's `h-control-md`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["inner", "element", "container"],
      spacing: ["control-sm", "control-md", "control-lg"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
