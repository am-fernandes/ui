---
"@amfernandesinc/ui": minor
---

**Overlays aceitam `ref` e `contentProps` no painel.** `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `Tooltip`, `DropdownMenu` e `Tour` agora encaminham `ref` para o painel (o elemento com `data-slot="…-content"`) e aceitam `contentProps` com `id`, `data-*`, `aria-*` e handlers para ele, como pede um teste ou uma medição. As props do próprio overlay (o `data-slot`, os handlers de que ele precisa) prevalecem.
