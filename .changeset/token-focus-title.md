---
"@amfernandesinc/ui": minor
---

**`Token` aceita os atributos de um `<span>` e mostra o rótulo cortado no `title`.** O `Token` tinha API fechada: não dava para passar `id`, `data-testid`, `aria-describedby` nem handlers. Agora eles vão para o chip. Um rótulo cortado pelas reticências ganha `title` com o texto inteiro ao passar o mouse.

A story `Removable` mostra como devolver o foco ao remover pelo teclado: o foco vai para o × do token que ocupa o lugar (ou do anterior) e, sem nenhum, para a mensagem de vazio, em vez de cair no `<body>`.
