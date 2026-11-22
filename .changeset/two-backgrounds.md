---
"@amfernandesinc/ui": minor
---

**Dois fundos.** `--background` passa a ser só **a página** (a área de conteúdo), um tom abaixo das superfícies. Tudo que é peça pinta `--card`: Card, moldura da DataTable e do Schedule, campos (Input, Textarea, inputs brasileiros, MultiInput, TimePicker, gatilhos de Combobox e de data, selects de paginação), botão `outline`, Toggle, aba ativa das Tabs, segmento ativo do SegmentedControl, marcadores do Stepper e o polegar do Switch. Menu lateral e navbar do AppShell pintam `--sidebar`. Dialog, AlertDialog e Sheet pintam `--popover`, como o Popover e o DropdownMenu. O Calendar deixa de ter fundo próprio e assume o da superfície em que está.

**Telas do app mudam:** um bloco que usava `bg-background` como superfície (um painel, uma barra de filtros) passa a ter o tom da página. Troque por `bg-card` com `border-border-strong`.
