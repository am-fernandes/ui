---
"@amfernandesinc/ui": minor
---

**`CurrencyInput` ganha `min` e `max`; `PercentageInput` ganha `min` e deixa de trocar o valor pelo teto.** No `PercentageInput`, digitar além de `max` trocava o número por 100 em silêncio: `12345` mostrava `100,00`, um valor que ninguém digitou. Agora a tecla (ou a colagem) que passaria de `max` é **recusada** e o campo fica com o que tinha (`12,34`). O valor nunca passa de `max`, como antes; quem contava com "digitar demais leva ao teto" precisa digitar o teto.

`min` vale quando o campo perde o foco depois de uma edição, porque durante a digitação o valor passa por números menores: abaixo de `min`, sobe para `min`. Passar pelo campo sem editar não muda nada. No `PercentageInput`, um `min` negativo libera percentual negativo, com a tecla de menos.

```tsx
<CurrencyInput label="Parcela" min={100} max={5000} value={parcela} onValueChange={setParcela} />
```
