---
"@amfernandesinc/ui": patch
---

**O × de um item do `MultiInput` fica fácil de acertar.** O botão de remover media 12 por 12 px, abaixo do mínimo de 24 px da WCAG 2.2 (2.5.8), e no celular era comum errar o toque. O ícone continua do mesmo tamanho e o item não cresce; a área que aceita o clique ou o toque em volta dele passou a ter 24 por 24 px. Cada item ganhou `data-slot="multi-input-item"`.
