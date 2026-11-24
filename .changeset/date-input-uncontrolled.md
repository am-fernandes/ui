---
"@amfernandesinc/ui": minor
---

**`DateInput` funciona sem estado externo.** `value` era obrigatório. Agora, sem `value`, o campo guarda a própria data a partir de `defaultValue` (ISO) e volta a ela quando o formulário é resetado, como um `<input>` nativo.
