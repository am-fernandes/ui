---
"@amfernandesinc/ui": minor
---

**`CPFInput`, `CNPJInput`, `CEPInput` e `PhoneInput` mantêm o cursor no lugar.** Corrigir um dígito no meio do campo jogava o cursor para o fim e o dígito seguinte entrava no lugar errado, embaralhando o número. Agora o cursor fica onde a pessoa está, ao digitar e ao apagar.

Backspace logo depois de um separador (o ponto de `123.|456`) apaga o dígito anterior a ele, e Delete logo antes apaga o seguinte; antes a tecla não apagava nada.
