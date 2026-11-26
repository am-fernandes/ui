---
"@amfernandesinc/ui": minor
---

**`CurrencyInput` ganha `min` e `max`; `PercentageInput` ganha `min` e deixa de trocar o valor pelo teto.** No `PercentageInput`, digitar além de `max` trocava o número por 100 em silêncio: `12345` mostrava `100,00`, um valor que ninguém digitou. Agora, nos dois campos, o valor fora da faixa fica como foi digitado ou colado e o campo mostra o erro (`labels.belowMin` e `labels.aboveMax`) quando perde o foco depois de uma edição, no Enter ou no envio. O envio nativo do formulário é barrado enquanto o valor estiver fora, e o erro some quando ele volta para a faixa. No `PercentageInput`, um `min` negativo libera percentual negativo, com a tecla de menos.

`onValueChange` entrega o valor mesmo fora da faixa: num formulário com `noValidate`, valide os limites no app.

```tsx
<CurrencyInput label="Parcela" min={100} max={5000} value={parcela} onValueChange={setParcela} />
```
