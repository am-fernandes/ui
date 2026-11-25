---
"@amfernandesinc/ui": patch
---

`BarChart` e `LineChart` medem os eixos de novo quando a fonte web da página termina de carregar. Antes, um gráfico desenhado antes de a Geist chegar ficava com as margens calculadas para a fonte reserva, e o primeiro hover redesenhava tudo, deslocando o gráfico alguns pixels.
