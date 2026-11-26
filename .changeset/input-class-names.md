---
"@amfernandesinc/ui": minor
---

**`Input` ganha `wrapperClassName` e `fieldClassName`.** O `className` do `Input` cai no `<input>` de dentro, que não tem borda nem fundo, e não havia como estilizar a caixa nem o campo inteiro. Agora `wrapperClassName` vai na caixa com a borda e o fundo, e `fieldClassName` no campo com rótulo e mensagens (largura, margens).

O `className` continua no `<input>`, para alinhamento de texto e `tabular-nums`. Para um ícone dentro da caixa use `leadingIcon` ou `trailingIcon` em vez de `pl-*` no `className`.
