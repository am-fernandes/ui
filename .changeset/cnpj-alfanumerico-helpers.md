---
"@amfernandesinc/ui": minor
---

**`isValidCNPJ` e `formatCNPJ` aceitam o CNPJ alfanumérico.** A Receita emite CNPJ com letras desde julho de 2026 (IN RFB 2.229/2024): as doze primeiras posições podem ter dígitos ou letras maiúsculas e os dois dígitos verificadores continuam numéricos. `isValidCNPJ("12.ABC.345/01DE-35")` agora é verdadeiro e `formatCNPJ("12ABC34501DE35")` devolve `"12.ABC.345/01DE-35"`. Os CNPJs só com números continuam válidos e formatados como antes.

Como letra passou a fazer parte do número, um texto com rótulo (`"CNPJ 11.222.333/0001-81"`) deixa de validar: passe só o número. Letras minúsculas são lidas como maiúsculas.
