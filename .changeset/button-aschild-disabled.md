---
"@amfernandesinc/ui": minor
---

**`Button asChild` passa a respeitar `disabled` e `loading`.** Com um link como filho (`<Button asChild disabled><a href="…">`), saía um `<a disabled>`: o atributo não significa nada num link, que continuava com cara de ativo, clicável e navegando.

Agora o filho recebe `aria-disabled="true"` e `data-disabled` (e `aria-busy` com `loading`), fica esmaecido e sem cursor de clique, continua alcançável pelo teclado e o clique não navega nem chama os handlers, nem o do `Button` nem o do próprio filho. O spinner continua não sendo injetado no filho.
