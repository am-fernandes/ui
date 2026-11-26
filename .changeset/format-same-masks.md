---
"@amfernandesinc/ui": minor
---

**`formatCPF`, `formatCNPJ`, `formatCEP` e `formatPhone` escrevem como os campos.** Os helpers de `lib/format` tinham máscaras próprias, diferentes das de `CPFInput`, `CNPJInput`, `CEPInput` e `PhoneInput`. Agora usam as mesmas: uma tabela e o formulário que edita o valor mostram o mesmo texto.

Muda na prática: `formatPhone("+55 11 98765-4321")` passa a dar "(11) 98765-4321" (sem o código do país e o zero de operadora, como o `PhoneInput`), em vez de devolver o texto como veio; e um valor que não é um documento inteiro sai limpo em vez de mascarado pela metade (`formatCPF("123456789001")` dá "123456789001", não "123.456.789-001").
