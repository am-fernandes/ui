---
"@amfernandesinc/ui": minor
---

**Raio por papel, em três níveis.** Sai o raio único de 4px; entram `--radius-inner` (4px), `--radius-element` (8px) e `--radius-container` (12px), com os utilitários `rounded-inner`, `rounded-element` e `rounded-container`. Os níveis sobem de 4 em 4, o passo do espaço interno padrão (`p-1`), então peça dentro de peça fecha exata pela regra do concêntrico (raio de dentro = raio de fora − espaço).

- **container** (12px): Card, Alert, Dialog, AlertDialog, Popover, painel do DropdownMenu, balão do Tour, moldura da DataTable e do Schedule, Video.
- **element** (8px): botões, campos, Toggle, Tooltip, trilho das Tabs e do SegmentedControl, itens de menu (12 − 4), de navegação e da Tree.
- **inner** (4px): Badge, Token, caixa do Checkbox, abas e segmentos (8 − 4), dias do Calendar (12 − 8), chips dentro de campos, eventos do Schedule, Skeleton, barras (Progress, linha do Stepper, barra de rolagem).
- A escala do Tailwind cai nos três níveis: `rounded-xs`/`rounded-sm` → 4px, `rounded-md` → 8px, `rounded-lg` até `rounded-4xl` → 12px. **Telas do app mudam:** o que usava `rounded-md` (4px) passa a 8px, e `rounded-lg` ou maior passa a 12px.
- `rounded-full` fica só para círculos (Radio, Avatar, Switch, pontos). Progress, a linha do Stepper e a barra de rolagem deixam de ser pílulas.
- `--radius` continua como sinônimo de `--radius-element` (agora 8px), deprecated.
- A moldura da DataTable passa a cortar o conteúdo nos cantos (`overflow-hidden`), para o cabeçalho não vazar do raio de 12px.
- Nova página **Foundations/Radius** no Storybook, com a explicação e uma demo do concêntrico.
