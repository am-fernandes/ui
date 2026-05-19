# @am-fernandes/ui

![version](https://img.shields.io/badge/version-10.0.0-black) ![license](https://img.shields.io/badge/license-proprietary-lightgrey)

Design system de UI da AM Fernandes — 41 componentes React, tokens Tailwind v4 e documentação Storybook.

## Instalação

Configure o registro privado (uma vez por máquina):

```bash
# ~/.npmrc
@am-fernandes:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Instale o pacote:

```bash
bun add @am-fernandes/ui
```

## Setup

Importe a fonte e os tokens no CSS de entrada da app:

```css
/* src/index.css */
@import "@am-fernandes/ui/fonts";
@import "@am-fernandes/ui/styles";
```

Use a helper `cn` ao combinar classes:

```tsx
import { cn } from "@am-fernandes/ui"

<div className={cn("p-4 rounded-md", isActive && "bg-primary")} />
```

## Componentes

| Categoria   | Count | Componentes |
| ----------- | ----- | ----------- |
| Primitives  | 11    | avatar, badge, button, checkbox, input, radio-group, separator, skeleton, switch, textarea, typography |
| Overlays    | 9     | alert, alert-dialog, collapsible, dialog, popover, progress, sheet, sonner, tooltip |
| Navigation  | 5     | accordion, breadcrumb, command-palette, sidebar, tabs |
| Forms       | 5     | calendar, combobox, date-input, date-range-picker, time-picker |
| Domain      | 5     | currency-input, file-upload, input-otp, multi-input, percentage-input |
| Data        | 6     | card, data-table, image, scroll-area, tree, video |

Helpers adicionais expostos pelo barrel (veja a aba **Hooks** no Storybook para a documentação completa):

- `cn` — merge de classes Tailwind via `clsx` + `tailwind-merge`.
- `useIsMobile` — hook de breakpoint (viewport menor que 768 px).
- `useComboboxOptions` — transforma arrays `{ id, nome }` em `ComboboxOption[]`.
- `buttonVariants`, `badgeVariants`, `alertVariants`, `typographyVariants` — CVA factories para reaproveitar variantes em `className`.
- `tableStyles` — classnames prontos para `<table>` cru.
- `toCents`, `fromCents`, `percentOfTotal`, `percentFromValue`, `centsToDisplay`, `formatBRL` — utilitários monetários (BRL, inteiros em centavos).
- `bytes`, `kb`, `mb`, `gb` — helpers ergonômicos de tamanho em bytes (unidades binárias).
- `REGEXP_ONLY_DIGITS` — re-export de `input-otp` para `pattern` do `InputOTP`.
- `toast` — re-export de `sonner` (use junto com `<Toaster />`).

## Scripts

```bash
bun run storybook        # http://localhost:6006
bun run build            # gera dist/ (package publicável)
bun run build-storybook  # gera storybook-static/
bun run typecheck        # tsc --noEmit
bun run lint             # biome check .
```

## Stack

- **React 19** + TypeScript
- **Tailwind CSS v4** (tokens via `@theme`)
- **Radix UI** primitives (a11y headless)
- **Storybook 10** (docs + a11y addon)
- **Bun** como runtime, package manager e bundler de stories

## Princípios

- **Light only** — apps internas; sem dark mode por escolha de produto.
- **Tokens são a API** — não hardcode cores ou raios em apps; consuma sempre via classe Tailwind (`bg-primary`, `rounded-md`).
- **Acessibilidade ≥ AA** — contraste, ARIA e foco validados via `addon-a11y`.

## Migração de apps existentes

Apps internas (`requerimento-contratos-pf`, `assistencia-tecnica`) devem migrar de cópias locais de shadcn/ui para este pacote. O processo é incremental, mantém os mesmos nomes de exports e troca apenas o caminho de import.

Veja o guia em Storybook → **Getting Started** (seção *Migração de apps existentes*).

## Licença

Proprietário. Uso restrito à AM Fernandes & Associados e suas aplicações internas. Veja [`LICENSE`](./LICENSE).
