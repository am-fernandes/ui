---
"@amfernandesinc/ui": minor
---

**`DataTable`: ordem alfabética em português.** As colunas ordenáveis comparam texto com `compareText`: acento e caixa não contam, então "Álvaro" vem antes de "ana" e "Ângela", e não depois de "Zuleica"; números dentro do texto seguem a ordem numérica ("Bloco 2" antes de "Bloco 10"). Números ordenam pelo valor, datas pelo tempo, e o `sortingFn` próprio de uma coluna continua valendo.
