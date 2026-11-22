# @amfernandesinc/ui

Component library para softwares enterprise da AM Fernandes Incorporadora. React 19, Tailwind v4, tema claro e escuro, flat, WCAG AA.

## Instalação

```bash
bun add @amfernandesinc/ui
```

Peer deps: `react@^19`, `react-dom@^19`, `tailwindcss@^4`.

## Setup

Importe os estilos e fontes no entrypoint da app (uma vez, no `main.tsx` ou no CSS principal):

```ts
import "@amfernandesinc/ui/styles"
import "@amfernandesinc/ui/fonts"
```

As famílias **Geist** e **Geist Mono** são self-hosted via `@fontsource/geist` e `@fontsource/geist-mono` — vêm como dependências do pacote, sem chamadas externas a Google Fonts.

## Importação

Suporta tanto barrel quanto subpath imports por componente:

```ts
// Tree-shake-friendly: barrel
import { Button, DataTable } from "@amfernandesinc/ui"

// Per-component: subpath
import { Button } from "@amfernandesinc/ui/button"
```

## Componentes (56 no total)

| Categoria  | Count | Componentes                                                                                          |
| ---------- | ----- | ---------------------------------------------------------------------------------------------------- |
| Primitives | 15    | Avatar, Badge, Button, Checkbox, IconButton, Input, Label, RadioGroup, SegmentedControl, Separator, Skeleton, Switch, Textarea, Token, Typography |
| Overlays   | 11    | Alert, AlertDialog, Collapsible, Dialog, DropdownMenu, Popover, Progress, Sheet, Toaster, Tooltip, Tour |
| Forms      | 5     | Calendar, Combobox, DateInput, DateRangePicker, TimePicker                                           |
| Navigation | 7     | Accordion, AppShell, Breadcrumb, CommandPalette, Pagination, Stepper, Tabs                          |
| Data       | 9     | Card, DataTable, EmptyState, Image, Schedule, ScrollArea, Tree, Video + helpers `columns` / `tableStyles` |
| Domain     | 9     | CEPInput, CNPJInput, CPFInput, CurrencyInput, FileUpload, InputOTP, MultiInput, PercentageInput, PhoneInput |

Helpers utilitários (BRL em centavos, tamanhos em bytes, `cn`, hooks) estão documentados na aba **Hooks** do Storybook.

## Filosofia

- **Claro e escuro, flat** — sem shadows; o tema escuro liga com a classe `dark` no `<html>`.
- **Raio por papel em três níveis** (4, 8 e 12px), densidade enterprise (`text-sm` no body, `py-3` nos inputs).
- **WCAG AA** de contraste e foco; cursor pointer em tudo que é clicável.

## Documentação

- Storybook local: `bun run storybook` (http://localhost:6006).
- Contribuição: [`CONTRIBUTING.md`](./CONTRIBUTING.md).
- Histórico de versões: [`CHANGELOG.md`](./CHANGELOG.md).

## Status

v0.0.2 — pre-release. Próximo release: v0.1.0 via `bun run changeset:version`.
