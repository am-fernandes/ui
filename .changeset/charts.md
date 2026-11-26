---
"@amfernandesinc/ui": minor
---

**Gráficos: `BarChart`, `LineChart` e `Sparkline`** (`@amfernandesinc/ui/bar-chart`, `/line-chart`, `/sparkline`), em SVG desenhado pelo React, sem dependência nova, com as cores de gráfico que a biblioteca já tinha.

- Até seis séries nas cores `--chart-1`…`--chart-6`, sempre nesta ordem; uma sétima é erro de desenvolvimento, com a orientação de agrupar em "Outros". A cor é da série: ocultar uma série pela legenda não repinta as outras, e `color` fixa a cor quando a lista muda.
- `BarChart`: `data`, `category`, `series`, `orientation` (`"horizontal"` para nomes longos), `stacked`, valores negativos a partir da linha do zero. Barras finas (até 24px), ponta arredondada e base reta, 2px de respiro entre barras e segmentos.
- `LineChart`: `x` como categoria ou data ISO (`"2026-03"` vira "mar."), `area` com uma série, pontos `null` interrompem a linha. Com duas a quatro séries, o nome vai no fim de cada linha quando não há colisão.
- Duas séries ou mais têm legenda (que mostra e oculta séries); uma série não tem. Eixos e grade discretos, números arredondados no formato brasileiro, compactos a partir de 10 mil; `formatValue` e `formatX` para dinheiro e unidades.
- Tooltip ao passar o mouse (por categoria nas barras, com linha vertical nas linhas) e o mesmo pelo teclado: o gráfico recebe foco, as setas percorrem os pontos e cada um é anunciado. Uma tabela com os mesmos números está sempre disponível para o leitor de tela; `showTable` a mostra.
- `title` obrigatório (é o nome acessível), `description`, `loading`, `emptyMessage` e `labels`. A largura acompanha o contêiner; em 360px a legenda vai para baixo e os rótulos rareiam. Visíveis em cores forçadas.
- `Sparkline`: tendência pequena para célula de tabela ou card, sem eixos nem tooltip, com `label` obrigatório que diz a tendência em palavras.
