---
"@amfernandesinc/ui": patch
---

**`AppShell`: recolher pelo teclado não perde o foco.** Enter em "Recolher menu" jogava o foco para o `body` (o botão era remontado) e o próximo Tab recomeçava do topo da página. O botão agora é o mesmo nos dois estados e o foco fica nele.
