---
"@amfernandesinc/ui": minor
---

**`CurrencyInput` ganha `allowNegative`.** Sem a prop (o padrão), o campo continua só com valores positivos. Com `allowNegative`, a tecla de menos torna o valor negativo, uma segunda (ou `+`) volta a positivo, e um número negativo colado mantém o sinal: digitar `-50` dá `-0,50` (antes, `0,50`), e um valor `-50` vindo de fora não perde mais o sinal na primeira tecla. Serve para estorno, desconto e saldo devedor.

Com `allowNegative` o campo abre o teclado de texto no celular, porque o teclado numérico do iOS não tem o sinal de menos; passe `inputMode` para trocar.
