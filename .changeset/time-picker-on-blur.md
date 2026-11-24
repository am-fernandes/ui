---
"@amfernandesinc/ui": minor
---

**`TimePicker` aceita `onBlur`.** Sem ele, o React Hook Form com `mode: "onBlur"` não validava o seletor ao sair dele. `onBlur` é chamado quando o foco sai dos dois campos, depois de o campo deixado ser completado ou limpo; passar da hora para os minutos não conta.
