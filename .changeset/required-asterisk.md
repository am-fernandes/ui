---
"@amfernandesinc/ui": patch
---

**O asterisco de campo obrigatório não entra mais no nome do campo.** Em `Input`, `Textarea`, `Checkbox`, `Switch` e `RadioGroup` o asterisco tinha `aria-label="obrigatório"`: o leitor de tela lia "E-mail obrigatório, obrigatório", porque o próprio controle já anuncia `required`. Agora o asterisco é só visual (`aria-hidden`) e o nome do campo é o rótulo.

Os campos cujo controle é um botão (`Combobox`, `DateInput`, `DateRangePicker`, `TimePicker`) continuam dizendo "obrigatório" junto do rótulo, agora num texto só para leitor de tela.
