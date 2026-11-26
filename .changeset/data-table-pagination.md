---
"@amfernandesinc/ui": minor
---

**`DataTable`: o rodapé usa a `Pagination` da lib.** No lugar dos botões anterior/próxima de 36 px, o rodapé mostra a `Pagination`: números de página com reticências, a faixa ("11–20 de 243") e o seletor de tamanho, com controles de 40 px. Os textos de `DataTableLabels` continuam valendo (`paginationPrevious`, `paginationNext`, `pageSize`), e o novo `labels.pagination` ajusta os outros textos da `Pagination`; `pageIndicator` fica obsoleto.

Passar só `onPaginationChange`, sem `pageIndex`, não congela mais a página: a tabela segue paginando e só avisa. Um novo array `data` com a mesma busca, filtros e ordenação não leva mais o usuário de volta à página 1 (um refetch ou uma linha editada mantêm a página); a volta acontece quando a busca, um filtro ou a ordenação mudam, e a nova prop `autoResetPage` liga ou desliga isso (padrão `true`, `false` com `manualPagination`). Se os dados encolhem abaixo da página atual, a tabela vai para a última página que existe.
