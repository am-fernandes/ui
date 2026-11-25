---
"@amfernandesinc/ui": patch
---

**`IconButton` e `Textarea` respeitam o cleanup de ref do React 19.** Um ref de callback que devolve uma função de limpeza (`ref={(el) => { observar(el); return () => parar() }}`) perdia essa função nesses dois componentes: a limpeza nunca rodava e o callback era chamado de novo com `null`. Agora a limpeza roda ao desmontar, como em `Button` e `Input`.
