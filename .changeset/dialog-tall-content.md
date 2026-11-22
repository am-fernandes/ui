---
"@amfernandesinc/ui": minor
---

**`Dialog` e `AlertDialog` não passam mais da altura da tela.** Um formulário longo num notebook ou num celular deixava o título acima da tela e o rodapé abaixo, e nada rolava. Agora o diálogo tem altura máxima (`100dvh` menos 1rem em cima e embaixo): título e descrição ficam no topo, o rodapé (ou os botões do `AlertDialog`) fica embaixo e só o corpo rola, com a barra de rolagem na borda do diálogo.

Não é mais preciso `max-h-*` + `overflow-y-auto` no `children`; quem já usa continua funcionando. O corpo passa a ser `[data-slot="dialog-body"]` com `overflow-y: auto` (no `AlertDialog`, os `children` ganham um invólucro `[data-slot="alert-dialog-body"]`, com o mesmo espaço de 16px entre eles). Um `Dialog` com padding próprio no `className` (`p-0`, `px-8`…) mantém o corpo dentro desse padding.
