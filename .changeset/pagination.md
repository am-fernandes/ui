---
"@amfernandesinc/ui": minor
---

**Pagination** (novo): paginação independente para listas, cards e tabelas paginadas no servidor (`@amfernandesinc/ui/pagination`).

- Total conhecido (`totalItems` + `pageSize`, ou `totalPages`) ou cursor (`hasMore`: só anterior/próxima).
- `variant="pages"` (padrão): números com reticências, sempre com o mesmo número de posições — o controle não muda de largura ao paginar, e uma reticência nunca esconde uma página só. `variant="compact"`: “Página 3 de 10”.
- Com `totalItems`, mostra o resumo “11–20 de 243”. `pageSizeOptions` + `onPageSizeChange` mostram o seletor de itens por página (o mesmo da `DataTable`); trocar o tamanho volta para a página 1.
- `showFirstLast`, `siblingCount`, `size` (`md` = 40px, `sm` = 32px), `disabled` e `labels` em pt-BR.
- `getPageHref` gera links de verdade (`?page=3`), com checagem de protocolo; `onPageChange` roda logo depois que o navegador segue o link.
- `<nav aria-label="Paginação">`, `aria-current="page"` e reticências escondidas do leitor de tela. Exporta também `getPaginationItems` e `defaultPaginationLabels`.
