---
"@amfernandesinc/ui": minor
---

**`DataTable`: a planilha traz o mesmo valor da célula.** A exportação lê cada coluna pelo seu acessor, o mesmo que a tabela usa: uma coluna `accessorKey: "cliente.nome"` (chave aninhada) deixa de sair vazia, e as colunas com `accessorFn` continuam saindo com o valor calculado.
