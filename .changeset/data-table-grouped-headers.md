---
"@amfernandesinc/ui": minor
---

**`DataTable`: cabeçalho agrupado.** Uma coluna com `columns` (um grupo, como "Cliente" sobre "Nome" e "Cidade") agora ocupa as suas colunas, com `colSpan` e `scope="colgroup"`; antes eram 2 `th` sobre 3 colunas. Só os cabeçalhos das colunas finais ordenam e recebem `aria-sort`, e o esqueleto de carregamento tem uma célula por coluna final.
