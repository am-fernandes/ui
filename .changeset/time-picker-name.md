---
"@amfernandesinc/ui": minor
---

**`TimePicker` aceita `name`.** Num formulário nativo o seletor não enviava nada. Com `name`, um `<input type="hidden">` envia `"HH:MM"` (ou `""` enquanto o horário está incompleto); os dois campos visíveis ficam sem `name`. Desabilitado, não envia.
