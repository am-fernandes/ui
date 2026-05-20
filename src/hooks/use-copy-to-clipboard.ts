import * as React from "react"
import { toast } from "sonner"

export function useCopyToClipboard() {
  const copy = React.useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copiado!")
    } catch {
      toast.error("Erro ao copiar")
    }
  }, [])

  return { copy }
}
