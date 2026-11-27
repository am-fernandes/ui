# @amfernandesinc/ui

Component library para softwares enterprise da AM Fernandes Incorporadora. React 19, Tailwind v4, tema claro e escuro, flat, WCAG AA.

## Instalação

```bash
bun add @amfernandesinc/ui
```

Peer deps: `react@^19`, `react-dom@^19`, `tailwindcss@^4.1`.

**Vindo da 0.5?** A 0.6 quebra tokens, layout e datas: siga [`src/docs/Migration.mdx`](./src/docs/Migration.mdx) (página **Migração 0.6** do Storybook) antes de atualizar.

## Setup

Importe os estilos e fontes no entrypoint da app (uma vez, no `main.tsx` ou no CSS principal):

```ts
import "@amfernandesinc/ui/styles"
import "@amfernandesinc/ui/fonts"
```

O `styles` já importa o Tailwind e declara o `@source` da própria lib, então as classes usadas só dentro dos componentes são geradas sem configuração no app. Na 0.5.x, acrescente no CSS de entrada `@source "../node_modules/@amfernandesinc/ui/dist";` (caminho relativo a esse CSS); sem ele, Dialog, Popover e Select aparecem sem estilo.

As famílias **Geist** e **Geist Mono** são self-hosted via `@fontsource/geist` e `@fontsource/geist-mono` — vêm como dependências do pacote, sem chamadas externas a Google Fonts.

## Importação

Suporta tanto barrel quanto subpath imports por componente:

```ts
// Tree-shake-friendly: barrel
import { Button, DataTable } from "@amfernandesinc/ui"

// Per-component: subpath
import { Button } from "@amfernandesinc/ui/button"
```

## Componentes (62 no total)

| Categoria  | Count | Componentes                                                                                          |
| ---------- | ----- | ---------------------------------------------------------------------------------------------------- |
| Primitives | 17    | Avatar, Badge, Button, Checkbox, IconButton, Input, NumberInput, RadioGroup, SegmentedControl, Separator, Skeleton, Slider, Switch, Textarea, Toggle, Token, Typography |
| Overlays   | 11    | Alert, AlertDialog, Collapsible, Dialog, DropdownMenu, Popover, Progress, Sheet, Toaster, Tooltip, Tour |
| Forms      | 6     | Calendar, Combobox, DateInput, DateRangePicker, Select, TimePicker                                   |
| Navigation | 7     | Accordion, AppShell, Breadcrumb, CommandPalette, Pagination, Stepper, Tabs                          |
| Data       | 12    | BarChart, Card, DataTable, EmptyState, Image, LineChart, Schedule, ScrollArea, Sparkline, Timeline, Tree, Video + helpers `columns` / `tableStyles` |
| Domain     | 9     | CEPInput, CNPJInput, CPFInput, CurrencyInput, FileUpload, InputOTP, MultiInput, PercentageInput, PhoneInput |

Helpers utilitários (BRL em centavos, tamanhos em bytes, `cn`, hooks) estão documentados na aba **Hooks** do Storybook.

## Filosofia

- **Claro e escuro, flat** — sem shadows; o tema escuro liga com a classe `dark` no `<html>`.
- **Paleta do grupo, sóbria** — grafite e o marinho que AM Fernandes e Ponto Forte dividem; cada status tem um fundo forte só, e as cores são conferidas também sob daltonismo simulado (`bun run audit:contrast`).
- **Raio por papel em três níveis** (4, 8 e 12px), densidade enterprise (`text-sm` no body; controles de 32, 40 ou 44px de altura pelo `size`, campos e botões alinhados).
- **WCAG AA** de contraste e foco; cursor pointer em tudo que é clicável.
- **Textos em pt-BR, trocáveis** — todo texto sai de `labels` com padrão pt-BR (ver Foundations/i18n).
- **Testado em navegador** — além dos testes de unidade, specs Playwright por componente (teclado, axe, 360px, cores forçadas) rodam na CI.

## Documentação

- Storybook local: `bun run storybook` (http://localhost:6006).
- Contribuição: [`CONTRIBUTING.md`](./CONTRIBUTING.md).
- Histórico de versões: [`CHANGELOG.md`](./CHANGELOG.md). Migração 0.5 → 0.6: [`src/docs/Migration.mdx`](./src/docs/Migration.mdx).
- Skill para agentes de IA: [`skills/designing-with-amfernandesinc-ui/`](./skills/designing-with-amfernandesinc-ui/SKILL.md). Ensina setup, escolha de componentes, formulários, dinheiro, datas, tabelas, gráficos e as regras visuais; a referência de API é gerada do código. Para usar num app, copie (ou crie um link para) a pasta em `~/.claude/skills/` ou em `.claude/skills/` do projeto.

## Status

v0.5.1 — pre-1.0. As mudanças pendentes estão em `.changeset/`; o próximo release sai com `bun run changeset:version`.
