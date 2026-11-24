---
"@amfernandesinc/ui": minor
---

**`DateInput` aceita `name`.** Num formulário nativo, o campo não enviava nada. Com `name`, um `<input type="hidden">` envia a data ISO (`1990-03-15`), a mesma que `onValueChange` reporta, e não o texto `15/03/1990` que aparece na tela; o campo visível fica sem `name`. Desabilitado, não envia.
