---
"@amfernandesinc/ui": minor
---

**Novo `NumberInput`** (`@amfernandesinc/ui/number-input`): campo de número para quantidades, áreas, andares e parcelas (dinheiro continua no `CurrencyInput`, percentual no `PercentageInput`).

- `value: number | null` + `onValueChange`, ou `defaultValue`; vazio é `null`, nunca `0`.
- Formato brasileiro: vírgula decimal e ponto de milhar quando o campo não tem foco (`1.250,5`); `decimals` (padrão 0), `min`, `max`, `step` (padrão 1). Fora da faixa, o valor é ajustado ao sair do campo.
- Digitação aceita dígitos, uma vírgula (o ponto do teclado numérico vira vírgula) e o menos só com `min` negativo; colar segue a regra do `CurrencyInput`.
- `role="spinbutton"` com `aria-valuenow`/`min`/`max`/`valuetext`; ↑/↓ um passo, PageUp/PageDown dez, Home/End vão a `min`/`max`. A roda do mouse nunca muda o valor.
- `steppers`: botões − e + de 24px que não tiram o foco e repetem enquanto pressionados (`labels.decrement`, `labels.increment`).
- `prefix` e `suffix` (`m²`) dentro do campo; com `name`, o formulário recebe o número bruto com ponto decimal, e um reset do formulário volta ao `defaultValue`. Anatomia de campo, `size` e `readOnly` como no `Input`; teclado numérico no celular e texto de 16px em telas de toque.
