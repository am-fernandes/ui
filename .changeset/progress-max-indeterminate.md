---
"@amfernandesinc/ui": minor
---

**`Progress` respeita `max` e tem estado indeterminado.** `max` era ignorado: `<Progress value={3} max={7} />` desenhava 3% em vez de 3/7, e o leitor de tela ouvia o valor errado. Agora a barra e o `aria-valuemax` seguem `max`.

Sem `value` (ou com `null`), a barra fica indeterminada: uma faixa corre de um lado ao outro, `data-state="indeterminate"` e sem `aria-valuenow`, para quando não se sabe quanto falta. Antes isso virava uma barra vazia, que parecia "0%". Com movimento reduzido a faixa fica parada no meio.
