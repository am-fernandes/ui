---
"@amfernandesinc/ui": patch
---

**`Dialog` volta a fechar com clique fora.** Para não fechar quando o clique vinha de um popover aninhado, o `Dialog` perguntava se existia em qualquer lugar do documento um `[role="grid"]`, um calendário, uma lista de comandos ou um popper aberto. Numa página com tabela, campo de data ou busca isso é sempre verdade, e o clique no fundo não fechava mais nada. A `CommandPalette`, que é um `Dialog` em volta de uma lista de comandos e não tem X, só fechava com Esc ou escolhendo um item.

Essa adivinhação saiu. Um clique num popover, menu, calendário ou lista aberto a partir do diálogo continua contando como clique dentro (eles são renderizados dentro do diálogo); qualquer outro clique fora fecha, como `dismissible` promete. O módulo também deixa de registrar um listener global de `pointerdown` ao ser importado.
