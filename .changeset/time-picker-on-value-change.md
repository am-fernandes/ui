---
"@amfernandesinc/ui": minor
---

**`TimePicker` reporta por `onValueChange`.** Como os outros campos de valor, o `TimePicker` passa a chamar `onValueChange("HH:MM")` (ou `""` enquanto incompleto) a cada edição que muda o horário: apagar a hora ou digitar uma fora da faixa reporta `""` na hora, sem esperar o campo perder o foco. `onChange` continua funcionando e está marcado como obsoleto.
