---
"@amfernandesinc/ui": minor
---

**Os campos de domínio não dão mais zoom no iPhone.** `CPFInput`, `CNPJInput`, `CEPInput`, `PhoneInput`, `CurrencyInput`, `PercentageInput` e o campo de digitação do `MultiInput` usavam texto de 14 px, e o Safari do iOS ampliava a página toda ao focar um deles. Em telas de toque (ponteiro grosso) o texto digitado passa a ter 16 px; com mouse continua com 14 px. A altura dos campos não muda.
