---
"@amfernandesinc/ui": patch
---

**Colar no `PercentageInput` lê o número como ele foi escrito.** A colagem seguia a regra da digitação (centésimos primeiro) e `12,5` colado virava 1,25. Agora o texto colado é lido com a mesma regra do `CurrencyInput` e substitui o valor do campo: `12,5`, `12.5` e `12,50%` viram 12,50; `7` vira 7,00. A digitação não muda.
