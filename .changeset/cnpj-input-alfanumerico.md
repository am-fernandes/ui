---
"@amfernandesinc/ui": minor
---

**`CNPJInput` aceita o CNPJ alfanumérico.** A Receita emite CNPJ com letras desde julho de 2026 (IN RFB 2.229/2024) e o campo descartava as letras: `12.ABC.345/01DE-35` virava `12.345.013/5`. Agora as doze primeiras posições aceitam dígitos ou letras, o que é digitado passa para maiúsculas e os dois dígitos verificadores continuam só numéricos. A máscara é `XX.XXX.XXX/XXXX-DD` e o pai recebe os 14 caracteres sem máscara (`"12ABC34501DE35"`).

O campo passa a abrir o teclado de texto no celular (`inputMode="text"` com `autoCapitalize="characters"`), porque o teclado numérico não tem letras. Como letra agora faz parte do número, um rótulo digitado junto conta como valor; na colagem, o CNPJ completo é achado no meio do texto (`"CNPJ: 12.ABC.345/01DE-35"` entra certo).
