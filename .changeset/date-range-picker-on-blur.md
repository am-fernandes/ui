---
"@amfernandesinc/ui": minor
---

**`DateRangePicker` aceita `onBlur`.** Sem ele, o React Hook Form com `mode: "onBlur"` não validava o seletor ao sair dele, e `touched` nunca ficava verdadeiro. `onBlur` é chamado quando o foco sai do seletor inteiro: entrar no calendário aberto, navegar entre os meses e usar "Limpar" ou "Confirmar" não contam. Passe `onBlur={field.onBlur}` no `Controller`.
