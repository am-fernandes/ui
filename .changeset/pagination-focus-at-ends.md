---
"@amfernandesinc/ui": patch
---

**`Pagination`: o foco não cai no `body` nas pontas.** Enter em "Próxima página" até a última página jogava o foco para o `body`, e o Tab recomeçava do topo da página. Nas pontas, anterior e próxima ficam `aria-disabled` e continuam no Tab (também no modo link, inclusive com `renderLink`), então o foco fica onde estava. "Página anterior" na página 1 passa a ser alcançável pelo Tab, anunciada como indisponível.
