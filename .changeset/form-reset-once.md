---
"@amfernandesinc/ui": patch
---

**`Switch`, `RadioGroup` e `SegmentedControl` avisam o reset do formulário uma vez só.** As versões novas do Radix (Switch 1.4, RadioGroup 1.5) também voltam ao estado inicial num `form.reset()`, e junto com o reset da própria lib o `onCheckedChange`/`onValueChange` era chamado duas vezes com o mesmo valor: um efeito colateral no callback (salvar a preferência, registrar um evento) rodava em dobro. Agora duas chamadas no mesmo evento contam como uma.
