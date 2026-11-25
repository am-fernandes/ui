---
"@amfernandesinc/ui": patch
---

**`Schedule`: plantão que vira a noite fica na grade de horas, e o horário de verão não desloca os eventos.** Nas visualizações de semana e dia, um evento com hora marcada de menos de 24 horas que cruza a meia-noite (um plantão das 22h à 1h) é desenhado na grade dos dois dias, cortado em cada um, em vez de ir para a faixa "Dia inteiro". Eventos de dia inteiro e de 24 horas ou mais continuam na faixa. A posição dos blocos passa a vir da hora do relógio, então um evento das 10h fica na linha das 10h mesmo no dia em que o horário de verão começa ou termina. No mês nada muda.
