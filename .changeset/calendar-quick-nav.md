---
"@amfernandesinc/ui": minor
---

Calendar: seleção rápida de ano e mês pelo título (estilo MUI DateCalendar). Clicar no caption ("julho 2026") abre uma grade de anos e depois de meses, posicionando o grid de dias direto no mês escolhido — sem navegar mês a mês. Ativo por padrão em `Calendar`, `DateInput` e `DateRangePicker` quando `captionLayout="label"` (o default); `captionLayout="dropdown"` mantém o comportamento nativo do react-day-picker. Com `startMonth`/`endMonth`, anos fora do intervalo não são listados e meses fora do limite ficam desabilitados. `Esc` cancela e volta para os dias.
