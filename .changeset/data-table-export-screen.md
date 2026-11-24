---
"@amfernandesinc/ui": minor
---

**`DataTable`: a planilha sai como a tela.** Sem `rowToRecord`, a exportação deixa de fora as colunas sem dado (ações), mantém lado a lado colunas com o mesmo título (antes uma sobrescrevia a outra), "Exportar dados filtrados" segue a ordenação da tela e `dateColumn` sai como data do Excel, não como o texto ISO. Uma coluna pode sair do arquivo com `meta.export: false` ou dar o próprio valor com `meta.export: (row, value) => ...`.

Uma exportação que falha (um `fetchAll` que rejeita, o arquivo que não pode ser escrito) não passa mais em silêncio: chama o novo `downloadable.onExportError(error)` e mostra `labels.exportError` ("Não foi possível exportar os dados. Tente de novo.") sob a barra até a próxima tentativa.
