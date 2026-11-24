---
"@amfernandesinc/ui": minor
---

**`DateRangePicker` funciona sem estado externo.** `value` e `onValueChange` eram obrigatórios. Agora, sem `value`, o seletor guarda o próprio período a partir de `defaultValue` e volta a ele quando o formulário é resetado. Um valor com hora (`"2025-03-14T00:00:00Z"`) passa a mostrar a data em vez de ficar vazio.
