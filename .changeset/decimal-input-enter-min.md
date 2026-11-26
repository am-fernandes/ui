---
"@amfernandesinc/ui": patch
---

**Campos decimais: Enter respeita o mínimo.** Em `CurrencyInput` e `PercentageInput`, apertar Enter enviava o formulário com um valor abaixo de `min`. Agora o limite é aplicado também no Enter, como já acontecia ao sair do campo.
