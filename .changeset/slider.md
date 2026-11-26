---
"@amfernandesinc/ui": minor
---

**Novo `Slider`** (`@amfernandesinc/ui/slider`): escolha de um valor ou de uma faixa arrastando (área mínima, faixa de preço, desconto).

- `value`/`onValueChange` com um número, ou com `range` dois polegares e um par `[mínimo, máximo]`; cada polegar tem nome próprio ("Preço mínimo", "Preço máximo", de `labels`), e os valores ficam sempre em ordem.
- `min`, `max`, `step`, `minStepsBetweenThumbs`; `showValue` mostra o valor ao lado do rótulo, formatado por `formatValue` (padrão: número brasileiro), que também é o que o leitor de tela ouve.
- `marks` desenha traços com rótulos opcionais, alinhados ao centro do polegar em cada valor.
- Polegares de 24px com o anel de foco da biblioteca; trilha e preenchimento por tokens; visível em cores forçadas; `aria-disabled` quando desabilitado.
- `label` (ou `aria-label`), `description`, `error`, `disabled`; com `name`, o formulário recebe o valor (uma faixa envia o nome duas vezes) e o reset volta ao `defaultValue`.
- Nova dependência: `@radix-ui/react-slider`.
