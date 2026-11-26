---
"@amfernandesinc/ui": minor
---

**`DateInput` aceita `onBlur`.** Sem ele, o React Hook Form com `mode: "onBlur"` não validava o campo ao sair, e `touched` nunca ficava verdadeiro. `onBlur` é chamado quando o foco sai do campo inteiro, depois de uma data inválida virar `""`: passar do texto para o botão do calendário ou para o calendário aberto não conta. Passe `onBlur={field.onBlur}` no `Controller`.
