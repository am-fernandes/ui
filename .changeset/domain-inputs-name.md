---
"@amfernandesinc/ui": minor
---

**Com `name`, os campos formatados enviam o valor limpo.** `CPFInput`, `CNPJInput`, `CEPInput`, `PhoneInput`, `CurrencyInput` e `PercentageInput` repassavam o `name` ao campo visível, e um `<form>` nativo (ou `FormData`) recebia o texto com máscara (`529.982.247-25`, `1.234,56`) enquanto `onValueChange` entregava o valor limpo. Agora o `name` vai para um `<input type="hidden">` com o mesmo valor que `onValueChange` reporta: os dígitos do documento, ou o número (`1234.56`) nos campos de dinheiro e percentual. O campo visível fica sem `name`.

Quem lia `form.elements[name].value` esperando a máscara passa a receber o valor limpo; para exibir, use `formatCPF`, `formatCNPJ`, `formatCEP`, `formatPhone` ou `toBRLMoney`.
