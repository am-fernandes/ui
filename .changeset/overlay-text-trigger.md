---
"@amfernandesinc/ui": minor
---

**Gatilho em texto funciona.** `trigger` é tipado como `ReactNode`, mas o Radix só sabe ligar o gatilho a um elemento: `trigger="Abrir"` não renderizava nada, sem erro. Agora, em `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `DropdownMenu` e `Collapsible`, um gatilho em texto vira um `Button` `outline` com esse texto. No `Tooltip`, um texto (um termo, uma sigla) vira um trecho focável com sublinhado pontilhado, alcançável pelo Tab; no `anchor` do `Popover`, um `<span>`.
