---
"@amfernandesinc/ui": patch
---

**`DataTable` no telefone.** A barra (busca, limpar filtros, exportar) e o rodapé (contagem e paginação) quebram linha em vez de espremer: a 375 px a busca ficava com 89 px ao lado de "Exportar para Excel" e os botões de página encolhiam até sair da caixa. Agora, a 360 px, a busca mantém uma largura usável, as ações descem para a linha de baixo e nada sai da tabela. A busca deixa de ficar presa a `max-w-sm` abaixo de 640 px.
