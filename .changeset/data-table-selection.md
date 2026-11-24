---
"@amfernandesinc/ui": minor
---

**`DataTable`: seleção de linhas.** `selectable` põe uma caixa por linha, com o nome da linha ("Selecionar C-2026-001", do texto da primeira coluna), e uma no cabeçalho, que seleciona as linhas da página e mostra o estado misto quando só algumas estão marcadas. A seleção é uma lista de ids (`getRowId`), então sobrevive à troca de página, à ordenação e às páginas do servidor. Controle com `selectedRowIds` + `onSelectionChange(ids)` ou comece com `defaultSelectedRowIds`.

Enquanto há algo selecionado, uma barra acima da tabela mostra a contagem, as ações de `selectionActions={(ids) => ...}` e "Limpar seleção". As linhas selecionadas ficam marcadas (`data-state="selected"`, fundo de destaque) e, em cores forçadas, ganham um contorno do sistema. As caixas têm alvo de 24 × 24 px. Os textos estão em `labels` (`selectPage`, `selectRow`, `selectedCount`, `clearSelection`).
