---
"@amfernandesinc/ui": minor
---

**`toBRLMoney` nunca mostra mais de duas casas e lê texto em formato brasileiro.** `toBRLMoney(1000 / 3)` devolvia `"333,333"` e `toBRLMoney("1.234,56")` devolvia `"1,234"`, porque o texto era lido com `parseFloat`. Agora o resultado tem sempre duas casas (`"333,33"`) e um texto é lido nos dois formatos: `"1234.56"`, `"1.234,56"` e `"R$ 1.234,56"` dão `"1.234,56"`.

Um texto como `"1.234"`, que antes saía como `"1,234"`, agora é lido como mil duzentos e trinta e quatro (`"1.234,00"`). O que não for número (`"abc"`, `NaN`) devolve `""` em vez de `"NaN"`.
