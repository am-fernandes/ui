---
"@amfernandesinc/ui": minor
---

**Os campos formatados ganham `size` e passam a medir 40px.** `CPFInput`, `CNPJInput`, `CEPInput`, `PhoneInput`, `CurrencyInput` e `PercentageInput` aceitam `size="sm" | "md" | "lg"` (32, 40 e 44px; padrão `md`). A altura vem do token de controle, borda incluída, e não mais do padding: o campo padrão passa de 42px para 40px e fica alinhado com botões e gatilhos do mesmo tamanho.

`size` deixa de ser o atributo nativo de largura em caracteres do `<input>`; para largura, use `className`.
