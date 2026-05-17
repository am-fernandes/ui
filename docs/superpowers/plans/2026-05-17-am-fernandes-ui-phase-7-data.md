# `@am-fernandes/ui` — Phase 7: Data & Misc Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Ship 4 data/misc components — card, table, chart, scroll-area — as `v0.6.0`. Final release of feature work; Phase 8 (migration guide + v1.0.0 tag) follows.

**Architecture:** Components in `src/data/`. Sources from `requerimento-contratos-pf` (card, table) and `am-fernandes/assistencia-tecnica` (chart, scroll-area). `chart.tsx` is the largest of this phase and has special handling for its built-in `dark` theme map.

**Sources:**
- `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/{card,table}.tsx`
- `am-fernandes/assistencia-tecnica`: `packages/web/src/components/ui/{chart,scroll-area}.tsx` (fetch via `gh api`)

**New deps:**
```
@radix-ui/react-scroll-area ^1.2.10
@tanstack/react-table       ^8.21.3
recharts                    2.15.4
```

(`recharts` pinned to `2.15.4` exact — chart.tsx targets the 2.x API; 3.x has breaking changes.)

## Special handling: chart.tsx and dark mode

`chart.tsx` declares an internal `THEMES = { light: "", dark: ".dark" }` constant and emits per-theme CSS for ChartContainer. The component generates a CSS block scoped to `.dark` selector — harmless in light-only apps (the selector never matches). **Keep this code intact** to preserve the canonical chart API and avoid drifting from upstream shadcn. Only strip `dark:` Tailwind utility classes that appear directly in `className=""` strings if any are present.

## Conventions

- Flat `src/data/<name>.tsx` + `<name>.stories.tsx`.
- Keep `"use client"`, `data-slot`, `displayName`, `forwardRef`.
- Import rewrites:
  - `@/lib/utils` → keep alias
  - `@/components/ui/...` → adjust to `../primitives/...` or relevant folder
- CSF3 `title: "Data/<Name>"`, `tags: ["autodocs"]`, `layout: "centered"`.
- Append `"Data"` to `.storybook/preview.tsx` `storySort.order` after `"Domain"`.
- Append exports to `src/index.ts` under `// Data` block.
- One commit per component.

## Tasks

### Task 0: deps + sort

Add 3 deps. `bun install`. Append `"Data"` to `storySort.order`. Verify gates. Commit: `chore(deps): add @tanstack/react-table + recharts + @radix-ui/react-scroll-area for Phase 7`.

### Task 1: card

Source: `requerimento-contratos-pf/src/components/ui/card.tsx`. Direct copy. No `dark:`.

Exports: `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent` (verify from source).

Story `Default` (`render: () => (...)`): a Card with header (title "Contrato 2026-001", description "Cliente A · vence em 30/05/2026"), content (a paragraph), footer (Button "Ver detalhes").

Commit: `feat(data): add card`.

### Task 2: table

Source: `requerimento-contratos-pf/src/components/ui/table.tsx`. Direct copy.

Exports: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`.

Story `Default` (`render: () => (...)`): a basic 4-row table of mock invoices: columns (Número, Cliente, Vencimento, Valor). Use plain Tailwind for the table wrapper width (`className="w-[600px]"`).

Commit: `feat(data): add table`.

### Task 3: scroll-area

Fetch source from assistencia: `gh api repos/am-fernandes/assistencia-tecnica/contents/packages/web/src/components/ui/scroll-area.tsx --jq '.content' | base64 -d > /tmp/scroll-area-source.tsx`. Read it.

Direct copy. Strip any `dark:` classes (audit needed).

Exports: `ScrollArea`, `ScrollBar`.

Story `Default` (`render: () => (...)`): `<ScrollArea className="h-[200px] w-[260px] rounded-md border p-4">` with 30 paragraphs (loop via map) so vertical scroll appears.

Commit: `feat(data): add scroll-area`.

### Task 4: chart

Fetch source from assistencia: `gh api repos/am-fernandes/assistencia-tecnica/contents/packages/web/src/components/ui/chart.tsx --jq '.content' | base64 -d > /tmp/chart-source.tsx`. Read it.

Direct copy. **Special:** keep the `THEMES = { light: "", dark: ".dark" }` constant intact (this is internal theming logic, not Tailwind `dark:` utilities). However, if there are any `dark:` Tailwind utility classes in `className=""` strings, strip them. `grep -E "className=.*dark:" src/data/chart.tsx` should return nothing after writing.

Exports: typically `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle` plus `type ChartConfig`. Verify from source.

Story `Default` (`render: () => (...)`): a small bar chart with mock data and 2 series using `ChartContainer` + `recharts` primitives (`BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`). Wrap in a `<div className="w-[480px] h-[280px]">` for layout.

Commit: `feat(data): add chart`.

### Task 5: verify + bump + tag

```bash
bun run typecheck && bun run lint && bun run build && bun run build-storybook 2>&1 | tail -3
grep -o '"Data/[^"]*"' storybook-static/index.json | sort -u
```

Expected: 4 Data entries (Card, Chart, ScrollArea, Table).

Bump `package.json#version` to `0.6.0`. Commit `chore(release): bump version to 0.6.0 for Phase 7`.

Tag `v0.6.0` "Phase 7: 4 data components (card, table, chart, scroll-area) — feature work complete".

## Risks

- **recharts 2.x vs 3.x:** the source targets 2.x. Pin to `2.15.4` exact (no caret) to avoid accidental 3.x install.
- **chart bundle size:** recharts is heavy (~150 KB minified). `dist/index.js` will jump significantly. That's expected; tsup externalizes recharts via peer-dep convention (recharts will NOT be bundled because of `external` config in tsup). Verify after build.
- **scroll-area:** if `dark:` audit finds classes, strip them. The source is small (~50 lines).
