# @am-fernandes/ui

![version](https://img.shields.io/badge/version-1.0.0-black) ![license](https://img.shields.io/badge/license-proprietary-lightgrey)

Design system de UI da AM Fernandes — 42 componentes React, tokens Tailwind v4 e documentação Storybook.

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
| Primitives  | 11    | avatar, badge, button, checkbox, input, label, radio-group, separator, skeleton, switch, textarea |
| Overlays    | 8     | alert, alert-dialog, dialog, popover, progress, sheet, sonner, tooltip |
| Composed    | 1     | confirm-button |
| Navigation  | 6     | accordion, breadcrumb, command, dropdown-menu, sidebar, tabs |
| Forms       | 8     | calendar, combobox, date-input, date-range-picker, field, form, multi-select, select |
| Domain      | 4     | currency-input, multi-number-input, input-otp, percentage-input |
| Data        | 4     | card, chart, scroll-area, table |

Helpers adicionais expostos pelo barrel:

- `cn` — merge de classes Tailwind.
- `useIsMobile` — hook de breakpoint.
- `toCents`, `fromCents`, `percentOfTotal`, `percentFromValue`, `centsToDisplay`, `formatBRL` — utilitários monetários (BRL, inteiros em centavos).

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

Veja o guia em Storybook → `docs/Migration`.

## Licença

Proprietário. Uso restrito à AM Fernandes & Associados e suas aplicações internas. Veja [`LICENSE`](./LICENSE).
