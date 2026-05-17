# `@am-fernandes/ui` — Design System Spec

**Status:** Draft — pending user review
**Date:** 2026-05-16
**Owner:** matheus.sena@amfernandes.com.br

## Context

A AM Fernandes mantém múltiplas apps internas (`requerimento-contratos-pf`, `assistencia-tecnica`, e potencialmente `portal-cliente-am-fernandes`, `new-amfernandes`, `v5-am-dashboard`) que hoje carregam cópias independentes do shadcn/ui. Cada uma drifta tokens, variantes e correções de bugs. O objetivo é consolidar tudo em um único package `@am-fernandes/ui` versionado, documentado em Storybook, consumível pelas apps via import.

### Projetos-referência

| Projeto | Stack | Theme atual | Componentes UI |
|---|---|---|---|
| `requerimento-contratos-pf` | Bun + Vite + React 19 + Tailwind v4 + shadcn (new-york, neutral) | Google Sans Flex, primary preto OKLCH, semânticas success/warning/info, status badges WCAG AA, dark mode | 36 |
| `assistencia-tecnica` (monorepo, `packages/web`) | Idem | shadcn padrão (HSL, neutro azulado, system fonts) | 31 |

**Fonte de verdade do branding:** `requerimento-contratos-pf` (theme já evoluído), com **dark mode removido** (light-only). Componentes exclusivos de `assistencia-tecnica` (`chart`, `input-otp`, `radio-group`, `scroll-area`, `sidebar`) são incorporados.

### Objetivos

- **Consistência visual** entre apps da empresa.
- **Velocidade** ao construir telas novas (sem reescrever inputs, dialogs).
- **Documentação viva** via Storybook acessível ao time.
- **Migração incremental** das apps existentes, sem big-bang.

### Não-objetivos (YAGNI)

- Dark mode (escolha explícita — apps internas, light only).
- Multi-brand / white-label (uma marca: AM Fernandes).
- Testes unitários iniciais (shadcn é battle-tested; stories cobrem cenários visuais).
- Suporte React 18 ou anterior (apps já estão em React 19).
- Suporte fora-Tailwind (consumidores devem usar Tailwind v4).

## Arquitetura

### Estrutura de repositório

```
ui/
├── package.json              # name: "@am-fernandes/ui"
├── tsconfig.json
├── tsup.config.ts            # bundler: tsup → ESM + .d.ts
├── biome.json                # lint/format (alinhar com apps)
├── .storybook/
│   ├── main.ts               # Storybook 8 + framework: @storybook/react-vite
│   ├── preview.tsx           # importa tokens.css + fonts.css; decorator de fonte
│   └── manager.ts            # tema branded da própria UI do Storybook
├── src/
│   ├── index.ts              # barrel de exports públicos
│   ├── lib/
│   │   └── utils.ts          # cn() — re-export tailwind-merge + clsx
│   ├── styles/
│   │   ├── tokens.css        # @theme + :root light-only (único arquivo)
│   │   └── fonts.css         # @import Google Sans Flex
│   ├── primitives/           # button, input, label, textarea, checkbox, switch, radio-group, badge, separator, skeleton, avatar
│   ├── overlays/             # alert, alert-dialog, dialog, sheet, popover, tooltip, sonner, progress
│   ├── navigation/           # tabs, breadcrumb, dropdown-menu, command, accordion, sidebar
│   ├── forms/                # form, field, select, combobox, multi-select, calendar, date-input, date-range-picker
│   ├── domain/               # currency-input, percentage-input, days-installment-input, input-otp
│   ├── data/                 # table, card, chart, scroll-area
│   └── docs/                 # *.mdx para foundations (Colors, Typography, Spacing, Radius, Iconography, Getting Started)
└── docs/superpowers/         # specs, plans
```

**Princípios:**

- Cada componente é uma pasta com `<nome>.tsx` + `<nome>.stories.tsx` co-localizados.
- Categorização por pasta define a hierarquia nativa do Storybook (sem `meta.title` artesanal por arquivo).
- `src/index.ts` faz barrel re-export de tudo público — consumidores importam de `@am-fernandes/ui`, nunca de subpaths internos.

### Stack

- **Runtime/build:** Bun (alinhado com `CLAUDE.md` global).
- **Bundler do package:** `tsup` (ESM + `.d.ts`, tree-shakeable).
- **Storybook:** 8.x + `@storybook/react-vite`.
- **Tailwind:** v4 (peer-dep).
- **Lint/format:** Biome (verificar se apps já usam; se sim, espelhar config).
- **Versioning:** semver manual (`changeset` opcional se complexidade crescer).

## Tokens & theming

- **Fonte única:** `src/styles/tokens.css` — adaptação do `globals.css` do `requerimento-contratos-pf` **sem o bloco `.dark`**.
- **Mantém do requerimento:**
  - `--font-sans: "Google Sans Flex"` (via `src/styles/fonts.css` que importa do Google Fonts).
  - Escala de radius: `--radius: 0.5rem` + `--radius-sm…--radius-4xl`.
  - Cores base OKLCH: background, foreground, card, popover, primary (preto), secondary (branco), muted, accent.
  - Semânticas: destructive, success, warning, info (+ `-foreground`).
  - Status badges WCAG AA: `--status-{success,warning,info,destructive}-{bg,text,border}`.
  - Inputs/borders/ring/placeholder.
  - Charts: `--chart-1..5`.
  - Sidebar: `--sidebar-*` tokens.
- **Remove:** todo o seletor `.dark { … }`. Apps não precisarão da classe `dark`.
- **Exporta:** `tokens.css` direto (via `package.json#exports["./styles"]`).

## Cobertura de componentes (41 totais)

### Primitives (11)
button, input, label, textarea, checkbox, switch, radio-group, badge, separator, skeleton, avatar

### Overlays & feedback (8)
alert, alert-dialog, dialog, sheet, popover, tooltip, sonner, progress

### Navigation (6)
tabs, breadcrumb, dropdown-menu, command, accordion, sidebar

### Forms compostos (8)
form, field, select, combobox, multi-select, calendar, date-input, date-range-picker

### Domínio AM (4)
currency-input, percentage-input, days-installment-input, input-otp

### Data & misc (4)
table, card, chart, scroll-area

### Preservações específicas

- **Button:** manter as props relacionadas à confirmação (`confirm`, `confirmTitle`, `confirmMessage`, etc.) que abrem `AlertDialog` automaticamente — feature já validada em produção no `requerimento-contratos-pf`. API exata a copiar 1:1 do componente atual.
- **Field:** manter o padrão `FieldSet` + `FieldLegend` (variantes `legend` | `label`) com seletores baseados em `data-slot` para auto-spacing.
- **Status badges:** documentar como variantes do `Badge` (não como componente separado) ou como helper `<StatusBadge variant="success">` — decidir no plano de implementação.

## Storybook

### Addons

- `@storybook/addon-essentials` (controls, actions, docs, viewport)
- `@storybook/addon-a11y` (axe-core nas stories)
- `@storybook/addon-themes` (toggle preparado para light only no início; estrutura pronta caso dark volte no futuro)

### Padrão de stories

Cada componente entrega:

- `Default` — caso comum.
- Uma story por `variant` (`Primary`, `Secondary`, `Destructive`, `Outline`, `Ghost`, `Link`).
- `WithIcon` (quando aplicável).
- `Disabled`, `Loading` (quando aplicável).
- `Playground` — controls completos para experimentação.

CSF3, autodocs ativo. JSDoc nas props gera a tabela de docs automaticamente.

### Foundations (MDX)

- `Getting Started.mdx` — instalação, setup do Tailwind/CSS, primeiro componente.
- `Colors.mdx` — paleta com swatches OKLCH + uso de cada token.
- `Typography.mdx` — escalas, line-height, Google Sans Flex.
- `Spacing.mdx` — escala Tailwind (referência).
- `Radius.mdx` — escala `--radius-*`.
- `Iconography.mdx` — Lucide React, tamanhos padrão.

### Deploy

- `bun run build-storybook` → `storybook-static/`.
- Deploy alvo sugerido: Cloud Run (padrão dos outros projetos da empresa, ex.: `requerimento-contratos-pf` tem `cloudbuild.yaml` + `Dockerfile`) servindo o estático via nginx. URL e infra exatos decididos no plano.

## Build, publish e consumo

### package.json (chaves)

```json
{
  "name": "@am-fernandes/ui",
  "version": "0.1.0",
  "type": "module",
  "files": ["dist"],
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./styles": "./dist/tokens.css",
    "./fonts": "./dist/fonts.css"
  },
  "scripts": {
    "build": "tsup && bun run build:styles",
    "build:styles": "cp src/styles/tokens.css dist/ && cp src/styles/fonts.css dist/",
    "dev": "tsup --watch",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19",
    "tailwindcss": "^4"
  }
}
```

### Registry

- **Privado em GitHub Packages** (org `am-fernandes`). Apps consomem via `.npmrc` com token de PAT já existente.
- Versionamento manual no início (`0.x.y`), avaliar `@changesets/cli` quando passar de ~5 contribuidores.

### Consumo nas apps

```css
/* index.css de cada app */
@import "@am-fernandes/ui/fonts";
@import "@am-fernandes/ui/styles";
```

```tsx
import { Button, CurrencyInput, Sidebar } from "@am-fernandes/ui";
```

## Migration path

1. Publicar `@am-fernandes/ui@0.1.0` (foundations + primitives — Fases 1 e 2).
2. Em `requerimento-contratos-pf`: PR adiciona dep + substitui `@/components/ui/button` por `@am-fernandes/ui` em **uma página piloto** (ex: lista de requerimentos). Smoke test manual + comparar com Storybook.
3. Codemod por regex (`sed -i`) para substituir imports em massa após validação.
4. Repetir em `assistencia-tecnica/packages/web`.
5. Após migração 100%, deletar `src/components/ui/*` das apps.
6. Releases subsequentes (`0.2.0`..`0.7.0`) adicionam Overlays → Navigation → Forms → Domain → Data.
7. `1.0.0` quando as duas apps consomem 100% via package.

## Testing

- **Visual:** stories são o teste de regressão visual (review manual no SB).
- **Interação:** Storybook play functions em componentes com lógica não-trivial (combobox, date-range-picker, command, multi-select).
- **Acessibilidade:** `addon-a11y` faz check axe-core em cada story; CI falha se houver violation crítica.
- **Tipos:** `bun run typecheck` no CI.
- **Sem testes unitários iniciais** — entrar caso bug específico apareça.

## Fases de implementação

| Fase | Entregável | Componentes | Versão |
|---|---|---|---|
| 1 | Repo + Bun + tsup + Storybook + tokens + foundations MDX | (foundations only) | `0.0.1` |
| 2 | Primitives | 11 | `0.1.0` |
| 3 | Overlays & feedback | 8 | `0.2.0` |
| 4 | Navigation | 6 | `0.3.0` |
| 5 | Forms compostos | 8 | `0.4.0` |
| 6 | Domínio AM | 4 | `0.5.0` |
| 7 | Data & misc | 4 | `0.6.0` |
| 8 | Migração total das apps + cleanup | — | `1.0.0` |

## Decisões abertas para o plano de implementação

Itens que o spec deixa sem decisão final por afetarem apenas execução, não escopo:

- **Sidebar:** o `sidebar.tsx` do shadcn é grande (~700 linhas) e tem sub-componentes (`SidebarProvider`, `SidebarMenu`, etc.). Decidir se entra inteiro como um único módulo ou se quebramos em sub-arquivos dentro de `src/navigation/sidebar/`.
- **Status badge:** variantes do `Badge` ou componente separado `StatusBadge`.
- **Calendar/date-picker:** `react-day-picker` v9 — confirmar versão e travar.
- **Charts:** o `chart.tsx` do shadcn depende de `recharts` — adicionar como peer-dep ou dep direta.
- **Biome vs ESLint+Prettier:** alinhar com o que as apps já usam (se ambas usam Biome, package usa Biome; se misto, default Biome).

Essas escolhas não bloqueiam o spec; serão resolvidas no implementation plan.
