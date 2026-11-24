---
"@amfernandesinc/ui": minor
---

**`Pagination` com `getPageHref`: Ctrl/⌘-clique não mexe na aba atual.** Abrir a página 4 numa nova aba fazia a aba original também marcar a página 4 (com a URL intacta). Um clique com Ctrl, ⌘, Shift ou o botão do meio agora fica só com o navegador: a nova aba abre e a atual continua onde estava, sem chamar `onPageChange`.
