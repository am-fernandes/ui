---
"@amfernandesinc/ui": patch
---

**`Calendar` marca o "hoje" de São Paulo, igual no servidor e no navegador.** O dia de hoje, o mês que abre sem `month`/`defaultMonth` e os atalhos `disabledDays` `"past"`, `"future"` e `"today"` (também no `DateInput` e no `DateRangePicker`) vinham do relógio da máquina. Entre 21h e meia-noite em Brasília, um servidor em UTC já está no dia seguinte: o servidor marcava um dia, o navegador outro, e a hidratação falhava. Agora o "hoje" é o de `America/Sao_Paulo`, como nos helpers de `lib/date`; a prop `today` continua valendo para outro fuso.
