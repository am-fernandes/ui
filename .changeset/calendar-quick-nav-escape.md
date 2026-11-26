---
"@amfernandesinc/ui": patch
---

**`Calendar`: Escape na escolha de ano e mês volta para os dias.** Dentro do popover do `DateInput` e do `DateRangePicker` (ou de qualquer `Popover` ou `Dialog`), Escape na navegação rápida fechava o popover inteiro. Agora o primeiro Escape volta para a grade de dias, com o foco no título; o segundo fecha o popover.
