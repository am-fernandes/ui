---
"@amfernandesinc/ui": minor
---

**`DataTable`: rodapé de colunas (totais).** O `footer` de uma coluna (`ColumnDef.footer`), que era ignorado, agora aparece num `<tfoot>` sob as linhas, com o estilo de `tableStyles().footer`. Use para totais, médias ou contagens; a função recebe o contexto do TanStack e pode somar as linhas filtradas. Sem nenhum `footer`, a tabela não ganha `<tfoot>`.
