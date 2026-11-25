---
"@amfernandesinc/ui": patch
---

**O × do `Token` tem área de toque de 24px.** O botão de remover media 16px (`sm`) e 20px (`md`), sobre um chip que também é clicável: fácil errar e acionar o chip. O desenho continua do mesmo tamanho; a área que responde ao clique passa a 24 por 24px, o mínimo do WCAG 2.2 (SC 2.5.8).
