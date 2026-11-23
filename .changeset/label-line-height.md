---
"@amfernandesinc/ui": minor
---

**Rótulos com altura de linha de texto.** O rótulo dos campos tinha `line-height` igual ao tamanho da fonte (14px em 14px): quando quebrava em duas ou mais linhas, elas encostavam uma na outra, e a caixa do `Checkbox` ficava no meio do bloco em vez de na primeira linha.

Agora o rótulo usa linhas de 20px. `Checkbox`, `Switch` e as opções do `RadioGroup` alinham o controle com a primeira linha do rótulo, em qualquer número de linhas. Efeito no layout: o rótulo acima de um campo ocupa 20px (eram 14px) com 4px até o campo (eram 6px), e a linha de um `Checkbox` passa de 16 para 20px; no `RadioGroup` a distância entre as opções continua a mesma (28px).
