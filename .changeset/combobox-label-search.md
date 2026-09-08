---
"@amfernandesinc/ui": minor
---

**Combobox**: a busca passa a considerar o `label`, não só o `value`.

- `keywords={[option.label]}` em cada item corrige o filtro default do cmdk quando `value` é um id opaco.
- No modo `creatable`, o `filter` recebe `keywords` e monta o haystack com `value + keywords`.
- `onWheel` com `stopPropagation` na `Command.List` para o scroll do dropdown não vazar para o container pai (Sheet/página).

Sem mudança de tipos públicos.
