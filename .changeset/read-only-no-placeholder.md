---
"@amfernandesinc/ui": patch
---

**Campo somente leitura não mostra placeholder.** Vazio e com `readOnly`, `Input`, `Textarea`, `NumberInput`, os campos formatados (`CPFInput`, `CNPJInput`, `CEPInput`, `PhoneInput`, `CurrencyInput`, `PercentageInput`), `MultiInput`, `DateInput` (`dd/mm/aaaa`), `TimePicker` (`--`), `DateRangePicker`, `Combobox` e `Select` ficam sem a dica. Ela era desenhada sobre o fundo esmaecido do somente leitura com contraste de 4,3:1 no claro e 4,1:1 no escuro, abaixo dos 4,5:1 da WCAG 1.4.3 (que isenta só o desabilitado), e uma dica de digitação num campo que não aceita digitação também orienta mal.
