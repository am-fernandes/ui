---
"@amfernandesinc/ui": minor
---

**`Toggle`: `size` passa a ser `sm | md | lg`, nas alturas dos outros controles.** O `Toggle` media 34, 42 e 46px (a altura saía do padding mais a borda) e chamava o tamanho do meio de `"default"`. Agora mede 32, 40 e 44px, borda incluída, e fica alinhado com um `Button`, `IconButton` ou `Input` do mesmo tamanho.

O padrão é `"md"`. `size="default"` continua aceito como nome antigo de `"md"`, mas está depreciado: troque por `"md"` (ou tire a prop).
