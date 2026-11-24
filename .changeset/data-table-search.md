---
"@amfernandesinc/ui": minor
---

**`DataTable`: a busca acha o que está na tela, sem acento.** Buscar `joao`, `123.456`, `1.234,50` ou `19/05/2026` agora encontra a linha que mostra "João", "123.456.789-01", "R$ 1.234,50" e "19/05/2026". A busca ignora acento e caixa (`matchesSearch`) e compara o texto que a célula mostra, não o valor bruto: um `t` deixa de casar com o "T" de toda data ISO.

Cada coluna pode dar o texto pesquisável em `meta.searchText: (row, value) => string`; `dateColumn` e `formattedColumn` já preenchem com a saída formatada, e nas outras vale o valor como texto. Sem `searchableColumns`, um `globalFilter` controlado procura em todas as colunas visíveis. O tipo `DataTableColumnMeta` descreve as chaves de `meta` que a tabela lê.
