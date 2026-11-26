---
"@amfernandesinc/ui": minor
---

**`DataTable`: colunas fixas à esquerda.** `pinnedColumns={{ left: ["numero", "cliente.nome"] }}` (por id ou `accessorKey`) leva essas colunas para a esquerda, na ordem dada, e as mantém no lugar quando a tabela rola para o lado, com uma linha depois da última. As células fixas não quebram linha e seguem a cor da linha (hover, seleção, `rowClassName`).
