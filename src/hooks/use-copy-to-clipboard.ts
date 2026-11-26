"use client"

import * as React from "react"

import { toast } from "../overlays/sonner"

export interface UseCopyToClipboardOptions {
  /** Toast after a copy. `false` shows nothing. @default "Copiado!" */
  successMessage?: string | false
  /** Toast when the copy fails. `false` shows nothing. @default "Erro ao copiar" */
  errorMessage?: string | false
  /** How long `copied` stays `true`, in milliseconds. @default 2000 */
  resetAfter?: number
}

/**
 * Copies text to the clipboard and tells the user.
 *
 * `copy(text)` resolves to `true` when it worked. `copied` turns `true` for
 * `resetAfter` milliseconds after a copy, so a button can swap its icon for a
 * check. The error toast stays until it is closed (the library's `toast`).
 * Outside a secure context (plain http), where `navigator.clipboard` does not
 * exist, it falls back to the browser's copy command.
 *
 * Pass the options inline or memoised; a new object every render is fine, the
 * hook reads them through a ref.
 */
export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
  const [copied, setCopied] = React.useState(false)
  const optionsRef = React.useRef(options)
  optionsRef.current = options
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const copy = React.useCallback(async (text: string): Promise<boolean> => {
    const {
      successMessage = "Copiado!",
      errorMessage = "Erro ao copiar",
      resetAfter = 2000,
    } = optionsRef.current
    try {
      await writeText(text)
    } catch {
      setCopied(false)
      if (errorMessage !== false) toast.error(errorMessage)
      return false
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), resetAfter)
    if (successMessage !== false) toast.success(successMessage)
    return true
  }, [])

  return { copy, copied }
}

async function writeText(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  // Plain http: no Clipboard API. The old copy command still works from a
  // click handler.
  const area = document.createElement("textarea")
  area.value = text
  area.setAttribute("readonly", "")
  area.style.position = "fixed"
  area.style.opacity = "0"
  document.body.appendChild(area)
  area.select()
  try {
    if (!document.execCommand("copy")) throw new Error("copy command refused")
  } finally {
    area.remove()
  }
}
