---
"@amfernandesinc/ui": patch
---

**`DataTable`: células vazias ficam juntas na ordenação.** `undefined` ia para a ponta oposta a `null` e a texto vazio. Na ordem padrão e no `dateColumn`, os três agora vêm primeiro na crescente e por último na decrescente. Colunas com `sortingFn` própria não mudam.
