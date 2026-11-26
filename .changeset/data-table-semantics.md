---
"@amfernandesinc/ui": minor
---

**`DataTable`: nome da tabela e cabeçalhos certos.** Novas props `aria-label`, `aria-labelledby` e `caption` dão nome à `<table>` (a `caption` também aparece, sob as linhas). Os `<th>` ganham `scope="col"`.

O botão de ordenar de cada coluna passa a se chamar pelo texto do cabeçalho ("Número"), e "Ordenar por Número" (`labels.sortBy`) vira a descrição dele. Antes o `aria-label` do botão virava o nome da coluna, e o leitor de tela lia "Ordenar por Número" a cada célula; com cabeçalho que não é texto, lia o id da coluna. Testes que procuravam `getByRole("button", { name: "Ordenar por Número" })` passam a usar `{ name: "Número" }` (ou `{ description: "Ordenar por Número" }`). O anel de foco desse botão fica por dentro, para não ser cortado na primeira coluna.
