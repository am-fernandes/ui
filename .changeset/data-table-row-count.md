---
"@amfernandesinc/ui": minor
---

**`DataTable`: modo servidor com o total certo.** A nova prop `rowCount` recebe o total de linhas no servidor: o rodapé (`showRowCount`) mostra esse número, não o tamanho da página, e a contagem de páginas sai dele quando `pageCount` não é passado. Sem nenhum dos dois, a tabela não mostra mais "Página 1 de -1": omite o total e mantém "próxima" disponível; com paginação no servidor e sem `rowCount`, a contagem de registros some em vez de mostrar o tamanho da página.

Na exportação, os escopos que a tabela não consegue preencher somem do menu: com `manualPagination`, "Exportar todos os dados" e "Exportar dados filtrados" só aparecem com `fetchAll` e `fetchFiltered`; com `manualFiltering`, "todos" pede `fetchAll`. Antes eles exportavam só a página atual com o nome de "todos".
