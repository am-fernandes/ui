---
"@amfernandesinc/ui": minor
---

**`Calendar`: nomes acessíveis em português.** O leitor de tela ouvia "Go to the Previous Month", "Go to the Next Month", "…, selected" e "Today, …", porque o locale do date-fns traduz só os nomes de mês e de dia. O calendário passa a usar o `ptBR` do `react-day-picker`: "Ir para o mês anterior", "Ir para o próximo mês", "…, selecionado", "Hoje, …". Vale também para o `DateInput` e o `DateRangePicker`. A prop `labels` do `DayPicker` continua sobrepondo esses textos.
