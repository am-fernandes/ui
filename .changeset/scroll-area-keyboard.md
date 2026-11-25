---
"@amfernandesinc/ui": patch
---

**`ScrollArea` rola pelo teclado e a barra aparece.** A área de rolagem não recebia foco: sem um link ou botão dentro, quem usa só o teclado não conseguia rolar. Agora ela é uma parada de Tab e rola com as setas e PageDown; com `aria-label` ou `aria-labelledby` vira uma região nomeada. O polegar da barra passa da cor de divisória (1,25:1 contra o fundo) para a de borda de campo (3:1 ou mais nos dois temas), e fica na cor do texto em alto contraste.
