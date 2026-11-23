---
"@amfernandesinc/ui": minor
---

**`Input` e `Textarea` com `readOnly` agora parecem somente leitura.** Antes o campo ficava idêntico a um editável, e um valor calculado ou travado parecia digitável. Agora ganha fundo `muted` e perde o anel de hover; continua focável, o texto pode ser copiado e o valor vai no envio do formulário.

Use `readOnly`, e não `disabled`, para mostrar um valor que não se edita: `disabled` apaga o campo e tira o valor do `FormData`. Com os dois ao mesmo tempo vale a aparência de desabilitado.
