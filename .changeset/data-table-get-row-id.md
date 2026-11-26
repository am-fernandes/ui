---
"@amfernandesinc/ui": minor
---

**`DataTable`: `getRowId`.** `getRowId={(row, index) => row.id}` dá a cada linha uma identidade estável. A tabela usa esse id como chave das linhas, então o que está dentro de uma linha (um campo digitado, um menu aberto) fica com aquela linha quando a página, a ordem ou os dados mudam; antes a chave era a posição, e uma anotação da linha 1 aparecia ao lado do cliente da página seguinte. Sem `getRowId`, a chave continua sendo o índice em `data`.
