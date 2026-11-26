---
"@amfernandesinc/ui": minor
---

**Véus dos overlays viram tokens.** O fundo escuro atrás de `Dialog`, `AlertDialog` e `Sheet` (preto a 80%) e o escurecimento em volta do alvo do `Tour` (preto a 50%) eram cores fixas no código. Agora vêm dos tokens `--color-scrim` e `--color-scrim-light` (utilitários `bg-scrim` e `outline-scrim-light`), com os mesmos valores de antes: nada muda na tela, e um produto pode ajustá-los no tema.
