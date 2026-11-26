---
"@amfernandesinc/ui": minor
---

**O `MultiInput` em modo número não aceita mais número malformado.** O campo usava `parseInt`, que lê o começo do texto e ignora o resto: `10.000` virava 10, `12x` virava 12 e `3,5` virava os itens 3 e 5. Agora cada pedaço precisa ser um inteiro positivo por inteiro; o que não for é recusado com `onReject("invalid")` e o texto fica no campo para ser corrigido. Os pedaços válidos do mesmo texto continuam entrando.

A vírgula segue separando itens (`30,60,90` e `10, 20`), com uma exceção: uma vírgula sozinha, encostada entre dois números (`3,5`), é lida como decimal e recusada. Para dois itens, use espaço, ponto e vírgula ou vírgula e espaço.
