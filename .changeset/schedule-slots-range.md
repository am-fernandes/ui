---
"@amfernandesinc/ui": minor
---

**`Schedule`: agendar num horário vazio e buscar o período na tela.**

- `onSlotClick(date)` recebe o dia clicado no mês (às 00h) ou o horário clicado na grade da semana e do dia, arredondado para a meia hora. Pelo teclado, o número de cada dia vira um botão "Novo evento em sábado, 21 de novembro", que entrega o dia às `scrollToHour` horas. O texto do botão fica em `labels.newEvent`.
- `onRangeChange({ start, end, view })` informa o período na tela ao montar e sempre que ele muda, para buscar os eventos no servidor, contando as semanas vizinhas que o mês mostra.
- `getScheduleRange(view, date, { weekStartsOn, listDays })` calcula o mesmo período antes do primeiro render.
