---
"@amfernandesinc/ui": minor
---

**`Dialog`, `AlertDialog` e `Sheet` devolvem o foco ao fechar mesmo sem `trigger`.** Um modal aberto por estado (`open`), a partir de um botão da página ou de um item de menu, deixava o foco no `<body>` ao fechar: quem usa teclado recomeçava do topo da página. Agora o foco volta para o elemento que o tinha quando o modal abriu. Se esse elemento sumiu com o popup em que estava (o item do "…" de uma linha de tabela, um botão dentro de um popover), o foco vai para o gatilho desse popup. Com `trigger`, nada muda.

Os três ganham `onCloseAutoFocus(event)`, para mandar o foco para outro lugar com `event.preventDefault()`.
