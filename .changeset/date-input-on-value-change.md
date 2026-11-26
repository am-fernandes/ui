---
"@amfernandesinc/ui": minor
---

**`DateInput` reporta por `onValueChange`.** Os outros campos de valor (`Combobox`, `DateRangePicker`, os de domínio) usam `onValueChange(valor)`; o `DateInput` usava `onChange(valor)`, que parece o evento de um `<input>`. `onValueChange` recebe a mesma string ISO (ou `""`). `onChange` continua funcionando e está marcado como obsoleto.
