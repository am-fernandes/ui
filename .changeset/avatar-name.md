---
"@amfernandesinc/ui": minor
---

**O `alt` do `Avatar` não some mais com o fallback.** O `alt`, obrigatório, só ia para a foto: sem `src`, com a foto carregando ou quebrada, "Ana Souza" não existia na página e o leitor de tela lia "AS" ou nada. Agora o avatar inteiro é `role="img"` com `aria-label={alt}`, igual com foto ou com iniciais; a foto e o fallback de dentro não repetem o nome.
