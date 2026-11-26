---
"@amfernandesinc/ui": patch
---

**`Schedule`: data inválida não derruba a tela.** Um `date` ou `defaultDate` inválido lançava `Invalid time value`. Agora a agenda mostra o período de hoje. Um `today` inválido também conta como ausente: o relógio dá o dia marcado como hoje, e o botão "Hoje" não entrega mais uma data inválida a `onDateChange`.
