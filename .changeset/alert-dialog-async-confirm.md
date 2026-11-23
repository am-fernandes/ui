---
"@amfernandesinc/ui": minor
---

**`AlertDialog` espera um `onConfirm` assíncrono.** Se `onConfirm` devolver uma Promise (o pedido por trás de "Aprovar" ou "Excluir"), o diálogo não fecha na hora: o botão de confirmar mostra o spinner e fica com `aria-busy`, os dois botões e o Esc deixam de responder, e o diálogo fecha quando a Promise resolve. Se ela rejeitar, o diálogo continua aberto e os botões voltam a funcionar, para você mostrar o erro dentro dele (em `children`) ou num toast e o usuário tentar de novo.

Os botões ficam com `aria-disabled` em vez de `disabled` durante a espera, para o foco não cair no `<body>`. Um `onConfirm` síncrono continua fechando na hora, como antes.
