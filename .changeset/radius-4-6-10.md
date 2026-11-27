---
"@amfernandesinc/ui": minor
---

A escala de raio passa a 4 / 6 / 10px: `element` vai de 8 para 6px e `container` de 12 para 10px (`rounded-md` vira 6px e `rounded-lg` em diante, 10px). O trilho das `Tabs` e do `SegmentedControl` continua com 8px, agora no token próprio `--radius-track` (`rounded-track`). Para os cantos ficarem concêntricos, contando a borda de 1px, o espaço interno dos menus (`DropdownMenu`, `Select`, `Combobox`, `CommandPalette` e o flyout do `AppShell`) passa a 3px, o do `Calendar` e da lista de eventos do `Schedule` passa a 5px, e os dias, as setas e a grade de mês e ano do `Calendar` usam o raio `inner`. No cabeçalho da `DataTable` compacta e nas `Tabs` com badge, as peças passam a ficar a 4px das bordas.
