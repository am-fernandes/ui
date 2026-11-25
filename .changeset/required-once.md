---
"@amfernandesinc/ui": minor
---

**"Obrigatório" lido uma vez só, e traduzível onde aparece.** Em `CPFInput`, `CNPJInput`, `CEPInput`, `PhoneInput`, `CurrencyInput`, `PercentageInput`, `DateInput`, `MultiInput`, `InputOTP` e `Combobox` o leitor de tela dizia "CPF obrigatório, editar texto, obrigatório": o rótulo trazia a palavra e o campo já anunciava `required`. Agora o rótulo desenha só o asterisco, como no `Input` e no `Select`.

O `DateRangePicker` (um botão) e o `TimePicker` (um grupo) não têm como anunciar `required` sozinhos e continuam dizendo a palavra no nome, agora vinda de `labels.required` (padrão "obrigatório"). Quem monta um `DateRangePickerLabels` ou `TimePickerLabels` completo para outro idioma ganha uma chave nova a preencher.
