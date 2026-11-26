---
"@amfernandesinc/ui": minor
---

**Altura de controle em token.** `tokens.css` ganha `--spacing-control-sm` (32px), `--spacing-control-md` (40px) e `--spacing-control-lg` (44px), usados como `h-control-md`, `min-h-control-md` e `size-control-md`. A altura passa a ser a da caixa inteira, borda incluída: um controle com borda e um sem borda do mesmo tamanho ficam alinhados numa linha.

Os gatilhos com cara de campo (Combobox, DateInput, DateRangePicker) já usam o token e medem 40px, não mais 42px.
