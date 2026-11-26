---
"@amfernandesinc/ui": patch
---

**Navegação rápida do `Calendar`: setas na grade de anos e de meses.** Os 201 botões de ano estavam todos na ordem do Tab e as setas não faziam nada. Agora cada grade é uma parada só do Tab (o ano ou mês escolhido), e dentro dela as setas andam por um e por linha, Home e End vão às pontas e PageUp e PageDown pulam quatro linhas; meses fora de `startMonth`/`endMonth` são pulados.
