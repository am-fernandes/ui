---
"@amfernandesinc/ui": minor
---

**Estado somente leitura nos campos formatados.** `CPFInput`, `CNPJInput`, `CEPInput`, `PhoneInput`, `CurrencyInput` e `PercentageInput` com `readOnly` mostram o valor num fundo esmaecido, sem reação ao hover: ele continua legível, recebe foco, pode ser copiado e é enviado no formulário, mas não aceita digitação nem colagem. É o estado para tela de consulta, que antes só dava para imitar com `disabled`, a 50% de opacidade e fora do Tab e do envio.
