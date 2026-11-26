---
"@amfernandesinc/ui": minor
---

**`DateRangePicker` aceita `name`.** Num formulário nativo o seletor não enviava nada. Com `name="vigencia"`, dois `<input type="hidden">` enviam `vigencia-from` e `vigencia-to` com as datas ISO (`""` para um extremo aberto). Desabilitado, não envia.
