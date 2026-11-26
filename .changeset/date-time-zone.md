---
"@amfernandesinc/ui": minor
---

**Os helpers de data passam a trabalhar no fuso de São Paulo, e data pura nunca muda de dia.** `src/lib/date` lia e formatava tudo em UTC. Às 21h30 em São Paulo já é o dia seguinte em UTC, então `formatDate(new Date(), "us")` devolvia a data de amanhã, `isPast("2026-11-23")` dizia que amanhã já tinha passado e `formatDate("2024-01-15T23:30:00-03:00", "brl-full")` mostrava `16/01/2024 02:30`.

Agora há um modelo só:

- **Data pura** (`"2024-01-15"`) é um dia do calendário: sai no mesmo dia em qualquer fuso. Em `isPast` e `isFuture`, hoje não é passado nem futuro.
- **Instante** (um `Date`, ou texto com `Z` ou deslocamento) é mostrado e comparado em `America/Sao_Paulo`: `formatDate("2024-01-15T23:30:00-03:00", "brl-full")` devolve `15/01/2024 23:30`.
- **Data e hora sem deslocamento** (`"2024-01-15T14:30"`) é o relógio da parede, igual no servidor e no navegador.

Todas as funções ganharam um último argumento opcional `timeZone` (o padrão é exportado como `DEFAULT_TIME_ZONE`). As assinaturas antigas continuam valendo; mudam os resultados:

- `formatDate("2024-01-15T14:30:00Z", "brl-full")` devolve `15/01/2024 11:30` (antes, `14:30`).
- `parseDate("2024-01-15", "14:30")` é 14h30 em São Paulo (`17:30Z`), e `parseDate("2024-01-15")` é a meia-noite de São Paulo (`03:00Z`).
- `isSameDay`, `startOfDay`, `endOfDay`, `startOfMonth`, `endOfMonth`, `addDays` e `addMonths` usam o calendário de São Paulo, inclusive nos anos com horário de verão.

**Como migrar.** Se o seu backend devolve datas puras como instante em UTC (`"2024-01-15T00:00:00.000Z"`), elas passam a cair às 21h do dia anterior. Passe `"UTC"` como `timeZone` (`formatDate(valor, "brl", "UTC")`) ou corte o texto para `YYYY-MM-DD` antes de formatar. Com `"UTC"` em todas as chamadas, o comportamento é o de antes.
