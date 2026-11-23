---
"@amfernandesinc/ui": minor
---

**`Switch`, `RadioGroup` e `SegmentedControl` voltam ao estado inicial num `form.reset()`.** Um `<button type="reset">` ou `form.reset()` devolvia os inputs e o `Checkbox`, mas esses três continuavam com a escolha antiga, na tela e no `FormData`. Agora voltam ao `defaultChecked` ou `defaultValue` (ou a nada escolhido). Controlados, pedem o estado inicial pelo `onCheckedChange` ou `onValueChange`, como o `Checkbox` já fazia.
