---
"@amfernandesinc/ui": minor
---

**`useCopyToClipboard` diz quando copiou.** O hook passa a devolver `{ copy, copied }`: `copied` fica `true` por `resetAfter` milissegundos (padrão 2000) depois de uma cópia, para o botão trocar o ícone por um check, e `copy(texto)` resolve `true` ou `false`. As mensagens vêm de opções (`successMessage`, `errorMessage`; `false` não mostra o toast). O erro usa o `toast` da lib e fica até ser fechado. Fora de HTTPS, onde não existe `navigator.clipboard`, o hook usa o comando de cópia do navegador. Quem só usava `copy` não precisa mudar nada.
