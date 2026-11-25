---
"@amfernandesinc/ui": patch
---

**`tableStyles()` com a densidade e a seleção do `DataTable`.** `head` e `cell` passam de `px-4 py-4` para `px-3 py-2.5`, a densidade de linha da lib (linhas de cerca de 41 px, antes 53 px), e a linha selecionada (`data-state="selected"`) usa `bg-accent text-accent-foreground`, como no `DataTable`, com contorno do sistema em cores forçadas. O `DataTable` passa a se desenhar com as mesmas classes, então os dois não se afastam mais. Tabelas feitas com `tableStyles()` ficam mais baixas.
