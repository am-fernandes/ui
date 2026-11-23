---
"@amfernandesinc/ui": minor
---

**`Popover` não passa mais da borda da tela.** Sem altura máxima, um conteúdo alto (uma lista de 40 colunas, um formulário de filtros) continuava para baixo da tela e não havia como chegar ao fim. Agora o popover para no espaço que sobra entre o gatilho e a borda (menos `collisionPadding`) e o resto rola, como já fazia o `DropdownMenu`.
