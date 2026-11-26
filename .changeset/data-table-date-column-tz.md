---
"@amfernandesinc/ui": minor
---

**`dateColumn`: fuso, `id` e `accessorFn`.** Um instante (`Date`, epoch ou ISO com `Z`/deslocamento) agora aparece no fuso de São Paulo, não no da máquina, e a nova opção `timeZone` escolhe outro: `"2026-05-19T00:00:00.000Z"` continua aparecendo como "18/05/2026 21:00" em São Paulo, e com `timeZone: "UTC"` vira "19/05/2026". Uma data pura (`"2026-05-19"`, `"19/05/2026"`) nunca muda de dia, em nenhum fuso, e um horário sem deslocamento (`"2026-05-19T14:30"`, `"19/05/2026 14:30"`) é lido como está.

`dateColumn` aceita `id` + `accessorFn` (campos aninhados, valores calculados), como `formattedColumn`. A ordenação compara instantes, a busca lê o texto da célula e a exportação grava a data e a hora que a célula mostra. `DateColumnOptions` passa a ser um tipo (união de `accessorKey` ou `accessorFn` + `id`).
