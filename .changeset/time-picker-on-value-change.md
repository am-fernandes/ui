---
"@amfernandesinc/ui": minor
---

**`TimePicker` reporta por `onValueChange`.** Como os outros campos de valor, o `TimePicker` passa a chamar `onValueChange("HH:MM")` (ou `""` enquanto incompleto). `onChange` continua funcionando e está marcado como obsoleto.
