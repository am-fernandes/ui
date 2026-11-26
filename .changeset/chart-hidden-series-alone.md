---
"@amfernandesinc/ui": patch
---

**`BarChart` e `LineChart`: o gráfico não fica mais vazio quando só sobra a série oculta.** Se `series` mudava e restava apenas uma série escondida pela legenda, não havia barras nem legenda para reexibir. Nesse caso ela volta a aparecer.
