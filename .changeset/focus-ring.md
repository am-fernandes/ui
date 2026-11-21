---
"@amfernandesinc/ui": minor
---

**Foco e campos do Astryx.**

- **Controles:** um anel só, contorno de 2px sólido na cor `--ring`, 3px afastado, em `:focus-visible`. Tokens `--focus-outline-width`, `--focus-outline-style`, `--focus-outline-color` e `--focus-outline-offset`; utilitários `focus-outline` e `focus-outline-inset` (células e itens que um contêiner cortaria). O mesmo anel é o padrão de todo elemento focável, então links e botões do app saem iguais aos da lib.
- **Campos** (Input, Textarea, inputs brasileiros, MultiInput, TimePicker, InputOTP, selects de paginação): visual de campo do Astryx (`field-states`). No foco, a borda vira a primária e ganha um anel interno de 2px da primária a 20% (25% no escuro); no hover, um anel interno da cor da borda a 30%. Com erro (`border-destructive field-error`), a borda fica vermelha também no foco e o hover usa o vermelho.
- Os gatilhos de **Combobox, DateInput e DateRangePicker** passam a ter o visual de campo (antes eram botões "outline") e agora mostram a borda vermelha de erro, que antes não mostravam.
- O × de remover do `Combobox` múltiplo, que não mostrava foco, passa a mostrar.
