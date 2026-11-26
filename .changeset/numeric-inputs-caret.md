---
"@amfernandesinc/ui": patch
---

**`CurrencyInput` e `PercentageInput` mantêm o cursor no lugar.** Corrigir um dígito no meio de `1.234,56` jogava o cursor para o fim e os dígitos seguintes entravam no lugar errado. Agora o cursor fica onde a pessoa está, ao digitar e ao apagar, e Backspace logo depois do ponto de milhar ou da vírgula apaga o dígito anterior a ele.

Com o campo em zero, a digitação preenche os centavos primeiro onde quer que o cursor esteja: um foco por script (`autoFocus`, `setFocus` do formulário), que deixa o cursor antes do `0,00`, não muda mais o resultado.

Um `value` que não é número (`undefined`, `NaN`) mostra `0,00` em vez de `NaN,NaN`. O 16º dígito digitado é recusado, em vez de empurrar o último para fora.
