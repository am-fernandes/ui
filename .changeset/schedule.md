---
"@amfernandesinc/ui": minor
---

**Schedule** (novo): calendário de eventos com visões de mês, semana, dia e lista (`@amfernandesinc/ui/schedule`). Data-driven: passe `events` com `start`/`end` em `Date` (instantes, mostrados no fuso `timeZone`, `America/Sao_Paulo` por padrão, como os helpers de `lib/date`).

- **Mês:** semanas inteiras, hoje destacado, dias de fora do mês esmaecidos. Eventos de dia inteiro e que atravessam a meia-noite viram barras que se estendem pelos dias (e continuam na semana seguinte); eventos com horário viram chips. Até 3 linhas por dia — o resto vira **+N mais**, que abre a lista do dia.
- **Semana e dia:** grade de horas com linha de "dia inteiro", eventos posicionados pelo horário, sobrepostos lado a lado, linha da hora atual e rolagem inicial em `scrollToHour` (8h). `minHour`/`maxHour` limitam o horário; `weekStartsOn={1}` começa na segunda.
- **Lista:** os próximos `listDays` dias agrupados por data, com `EmptyState` quando não há eventos.
- Cabeçalho com "Hoje", anterior/próximo e troca de visão (`SegmentedControl`); título do período anunciado ao navegar.
- `renderEventDetails` abre um popover ao clicar no evento; `onEventClick` avisa o clique. Cada evento é um botão com nome completo em pt-BR (título, dia e horário).
- 9 cores de categoria (`color`), com contraste AA. `today` fixa o que conta como hoje (testes e capturas). `view`/`date` podem ser controlados; textos trocáveis em `labels`.
- **Renderização no servidor (Next.js, Remix):** dias, horários e títulos saem no fuso `timeZone` em qualquer máquina, então um servidor em UTC e um navegador em Brasília escrevem o mesmo HTML. O relógio do navegador só entra depois da hidratação: sem `today`, o servidor não marca o "hoje" nem desenha a linha da hora atual; sem `date`, `defaultDate` ou `today`, o servidor manda o cabeçalho e a moldura, e o período chega no navegador. Passe `defaultDate` e `today` para o servidor já mandar a agenda pronta. `getScheduleRange` aceita o mesmo `timeZone`. Eventos de dia inteiro começam à meia-noite desse fuso.
