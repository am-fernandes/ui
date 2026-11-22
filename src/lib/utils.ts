import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Teach tailwind-merge the three radius levels, so `rounded-none` passed by a
// consumer replaces a component's `rounded-element` instead of piling up.
const twMerge = extendTailwindMerge({
  extend: { theme: { radius: ["inner", "element", "container"] } },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
