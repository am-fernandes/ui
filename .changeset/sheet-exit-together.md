---
"@amfernandesinc/ui": patch
---

**Fundo e painel do `Sheet` saem juntos.** Ao fechar, o fundo escuro sumia em 175ms (o tempo de saída dos diálogos) enquanto o painel ainda deslizava por 410ms: a página clareava com o painel na frente. Agora o fundo do `Sheet` segue o tempo do painel, na entrada e na saída.
