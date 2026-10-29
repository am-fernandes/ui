---
"@amfernandesinc/ui": patch
---

**formattedColumn**: deixa de emitir `sortingFn: undefined` e `enableSorting: undefined` quando as opções não são informadas. O TanStack Table monta a coluna com `{ ...defaults, ...columnDef }`, então a chave própria com valor `undefined` sobrescrevia o default `"auto"` e `getSortingFn()` passava a devolver `undefined`. Em tabelas com coluna ordenada e filtro/busca ativos, isso derrubava a página com `r.sortingFn is not a function`. Agora, sem `sortingFn`, a coluna volta a usar o comparador automático do TanStack, como a documentação da opção já descrevia. Quem passa `sortingFn`/`enableSorting` explícitos não é afetado.
