---
"@amfernandesinc/ui": patch
---

**`Calendar`: o popover não muda de largura ao abrir a escolha de ano e mês.** A grade de anos e meses tinha 212 px e a de dias 296 px, então o popover do `DateInput` encolhia ao clicar no título e voltava a crescer ao escolher o mês; com dois meses, no `DateRangePicker`, encolhia para menos da metade. Agora os painéis de ano e mês têm a largura da grade de dias que substituem, inclusive com vários meses lado a lado. O dia passa a ter exatamente 40 px, o tamanho que já tinha na prática.
