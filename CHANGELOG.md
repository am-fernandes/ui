# Changelog

All notable changes to `@am-fernandes/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [8.0.1] — 2026-05-18

### Fixed
- `FileUpload` camera dialog now shows a "Iniciando câmera…" spinner while
  `getUserMedia` resolves and the first frame loads (waits for the `<video>`'s
  `loadeddata` event). The "Tirar foto" button is disabled until the stream is
  ready, so users can't snapshot a black frame. Improves perceived latency on
  the inevitable browser-permission + hardware-warmup delay.

## [8.0.0] — 2026-05-18

### Breaking
- `FileUpload` `preview` is now `"thumbnail" | "none"` (the `"list"` mode was removed —
  it was strictly inferior to `"thumbnail"` since the thumbnail row already shows the
  filename and size).

### Added
- **Size helpers** `bytes`, `kb`, `mb`, `gb` exported from `@am-fernandes/ui` (`src/lib/size.ts`).
  Express byte sizes ergonomically: `<FileUpload maxSize={mb(2)} />` instead of
  `<FileUpload maxSize={2 * 1024 * 1024} />`. Binary units (KiB/MiB/GiB).
- `FileUpload` **clickable previews**:
  - Images: clicking the thumbnail opens the photo in a full-screen lightbox (Dialog).
  - Documents (PDF, etc.): clicking opens the file in a new tab via `URL.createObjectURL`.
- `FileUpload` **`camera?: boolean`** prop. When `true`, an extra "Capturar foto" button
  appears next to the dropzone. Clicking opens a `getUserMedia` video stream in a Dialog
  with a "Tirar foto" action that snapshots a `image/jpeg` file (uses `facingMode: "environment"`).
  Falls back with a friendly error message if `getUserMedia` is unavailable or denied.
  Requires HTTPS or localhost.
- New Storybook stories on `Domain/FileUpload`: `ComCamera`, `HelpersDeTamanho`.

## [7.1.0] — 2026-05-18

### Added
- `DataTable` accepts a `showRowCount?: boolean` prop. When `true`, the footer renders the
  total row count (`12 registros`) or `<filtrados> de <total> registros` when a search
  filter is active. Composes with `pagination` — both appear side-by-side. New stories:
  `WithRowCount`, `WithRowCountAndPagination`.

## [7.0.0] — 2026-05-18

### Added
- **`FileUpload`** component (`src/domain/file-upload.tsx`) — drag-and-drop + click-to-pick
  with controlled and uncontrolled modes. Props: `accept` (MIME pattern string or array),
  `multiple`, `maxSize`, `maxFiles`, `preview` (`"thumbnail" | "list" | "none"`),
  `value`/`onValueChange`, `onReject` (typed rejection reasons: `"type" | "size" | "max-files"`),
  `disabled`, `error`, `label`, `description`. Thumbnail preview for images via
  `URL.createObjectURL`. Default `label` and `description` derive from `accept`/`maxSize`.
- 7 unit tests covering accept/size/maxFiles paths.
- Storybook stories: `Playground` (live Controls), `Default`, `ImagensComPreview`,
  `PDFsListView`, `Controlled`, `ComRejeicaoEToast`, `Disabled`, `ErrorState`.

### Changed
- **Storybook docs overhaul** — every story across the 7 categories now ships rich
  autodocs:
  - `parameters.docs.description.component` paragraph + bulleted prop list (PT-BR).
  - `argTypes` per documented prop with explicit `control` (radio/select/object/number/text),
    `description`, and `table.type.summary` / `defaultValue.summary` so the Storybook
    args table shows the real TypeScript shape.
  - A `Playground` story driven by `args` so users can tweak props live via the Controls
    panel (covers Primitives, Overlays, Navigation, Forms, Domain, Data).
  - **DataTable**: prose now includes an explicit "Como definir colunas" code example
    showing basic / custom `cell` / `enableSorting: false` patterns and a pointer to
    the `@tanstack/react-table` `ColumnDef` reference.

## [6.0.0] — 2026-05-18

### Breaking
- `Breadcrumb`, `Tabs`, `Accordion`, `DropdownMenu` are now **items-only**. All composicional sub-component exports were removed (`BreadcrumbList`/`Item`/`Link`/`Page`/`Separator`/`Ellipsis`, `TabsList`/`Trigger`/`Content`, `AccordionItem`/`Trigger`/`Content`, `DropdownMenuTrigger`/`Content`/`Item`/`CheckboxItem`/`RadioItem`/`Label`/`Separator`/`Shortcut`/`Group`/`Sub`/`SubContent`/`SubTrigger`/`RadioGroup`/`Portal`, and the `DropdownMenuItems` helper).
- Migration: use the `items` prop. For DropdownMenu, also pass a `trigger` ReactNode. See stories for current API.

### Added
- `DataTable` supports pagination via `pagination={{ pageSize: 5 }}` prop.

## [5.0.0] — 2026-05-18

### Breaking
- `MultiNumberInput` renamed to `MultiInput` with a discriminated `type` prop:
  - `type="string"` (default): free-text tokens, preserves insertion order, deduped.
  - `type="number"`: positive-integer tokens (sorted asc, deduped) — previous behavior.
  - Migration: existing `<MultiNumberInput value={[30, 60]}>` becomes `<MultiInput type="number" value={[30, 60]}>`. The string-mode tokenizer splits on commas/newlines only (numbers also accept slashes and whitespace).

### Added
- `RadioGroup` accepts `orientation="horizontal"` (default `"vertical"`). Passed through to Radix Root so keyboard arrows respect the visual axis and `aria-orientation` is set.

### Fixed
- MDX tables (Getting Started "Categorias", Typography font comparison) now render correctly. Added `remark-gfm` to `@storybook/addon-docs` so GFM table syntax produces `<table>` instead of literal text.

## [4.0.0] — 2026-05-18

### Breaking
- `ConfirmButton` removed. Use `AlertDialog` directly when a confirmation flow is needed.
- `DaysInstallmentInput` renamed to `MultiNumberInput`, now with optional `prefix` and `suffix` per token (generalized beyond the original "days" use case).

### Added
- `cursor-pointer` + `disabled:cursor-not-allowed` on interactive primitives (Button, Checkbox, RadioGroup, Switch, Tabs, Accordion, Command items, DropdownMenu items, Dialog/Sheet close X).
- `engines: { node: ">=20", bun: ">=1.1" }` in `package.json` — Node compatibility verified, no Bun-only APIs in published code.
- Convenience `items` API on **Breadcrumb**, **Tabs**, **Accordion**; new `<DropdownMenuItems items={...}>` helper on **DropdownMenu**. Verbose composicional APIs preserved.
- **Form** story expanded with multi-field example using `Combobox` via RHF `Controller`.
- **Chart** stories: Bar, Line, Area, Pie, RadialBar variants + recharts-wrapper description.
- **DataTable** component: sortable headers + global search filter via `@tanstack/react-table`. Primitive `Table` exports remain available for raw control.
- Per-component description (`parameters.docs.description.component`) on every story (46 files).
- **vitest** + **@testing-library/react** + **@vitest/coverage-v8** + **jsdom** infrastructure. 95 smoke tests across 46 files. Scripts: `test`, `test:watch`, `test:coverage`.
- Storybook **Quality** MDX page documenting testing strategy + coverage commands.

### Changed
- **Getting Started** rewritten in best-in-market style (install, setup, conceitos, FAQ); absorbs former Migration content.
- **Typography** foundations page rewritten — variants-only display + rationale for Google Sans Flex vs Inter/Roboto/Nunito Sans.
- **Colors** foundations page now displays live oklch values next to each swatch name.

### Removed
- `Migration.mdx` (content folded into Getting Started).
- `Radius.mdx` foundation page (default radius is baked into components).

## [3.1.0] — 2026-05-18

### Added
- `Collapsible` (Radix primitive) in Overlays.
- `Image` champion component (lazy, a11y, aspect-ratio, blur/skeleton placeholders) in Data.
- `Video` champion component (lazy IntersectionObserver, captions track, autoPlay-mute pattern) in Data.
- `Tree` (recursive, controlled or uncontrolled expand + single-select) in Data.
- `@radix-ui/react-collapsible` dependency.

## [3.0.1] — 2026-05-17

### Fixed
- `Alert` semantic variants (`info`, `success`, `warning`, `destructive`) now
  use the `--status-*-{bg,text,border}` token family designed for tinted-bg
  containers (Phase 1) instead of `text-{semantic}-foreground` which was
  white and invisible against the 10% tinted backgrounds. All 4 semantic
  alerts now meet WCAG AA contrast.
- `Alert` `Variants` story now renders all 5 variants (default + 4 semantic)
  instead of only 2. Surface coverage matches the `cva` definition.

## [3.0.0] — 2026-05-17

### Changed (BREAKING)
- Removed `Select` and `MultiSelect` components. Use `Combobox` with the
  new `multiple` prop instead. Search is always enabled.
- Removed `@radix-ui/react-select` dependency.

### Added
- `Combobox` accepts an `icon` per option (feature parity with the old
  `MultiSelect`).

### Migration
- See `src/docs/Migration.mdx` v3.0.0 section.

## [2.0.1] — 2026-05-17

### Fixed
- `TimePicker` (`src/forms/time-picker.tsx`) rewritten as a custom 24h dual-input. Native `<input type="time">` follows the OS/browser locale, so even with `lang="pt-BR"` it could render as 12h AM/PM. The new implementation uses two numeric inputs (HH and MM) separated by `:` inside a single styled container, guaranteeing 24h display regardless of locale. Adds keyboard support (ArrowUp/Down increments with wrapping at the field's bounds; `:` jumps focus to the minute field).

## [2.0.0] — 2026-05-17

### Breaking
- `Button` no longer supports `size="sm"` or `size="lg"`. Only `default` and `icon` (shape) sizes remain. Migration: drop the prop (defaults to `default`) or replace with custom Tailwind classes via `className`.
- `SidebarMenuButton` no longer supports `size="sm"` or `size="lg"`. Only `default` remains.

### Added
- `TimePicker` primitive (`src/forms/time-picker.tsx`): lightweight wrapper around native `<input type="time">` with our Input styling. Defaults to 24h pt-BR via `lang="pt-BR"` and minute precision (`step={60}`). Both overridable.
- `Typography` primitive (`src/primitives/typography.tsx`): polymorphic component with 5 semantic variants (`display`, `title`, `subtitle`, `body`, `caption`). Each variant has a default semantic element, overridable via `as` prop.
- `src/docs/Typography.mdx` updated with `## Componente Typography` section documenting the new primitive.

### Changed
- `Calendar` (`src/forms/calendar.tsx`) now defaults its `locale` prop to `ptBR` (imported from `date-fns/locale`). Consumers can override (e.g., pass `enUS`).

## [1.0.0] — 2026-05-17

### Added
- First stable release — feature work complete; documentation + migration guide added.
- `README.md` rewritten with full component inventory, install/setup instructions and migration pointer.
- `src/docs/Migration.mdx` Storybook page with step-by-step guide for consuming apps (`requerimento-contratos-pf`, `assistencia-tecnica`).
- `src/docs/GettingStarted.mdx` updated to reflect all 7 categories shipped.
- `LICENSE` (proprietary, AM Fernandes & Associados).

## [0.6.0] — 2026-05-17

### Added
- 4 data components: card, chart, scroll-area, table.
- `// Data` section in barrel and Storybook sidebar.
- Dependencies: `@tanstack/react-table`, `recharts`, `@radix-ui/react-scroll-area`.

## [0.5.0] — 2026-05-17

### Added
- 4 AM-domain components: currency-input, percentage-input, days-installment-input, input-otp.
- Currency helpers exported from barrel: `toCents`, `fromCents`, `percentOfTotal`, `percentFromValue`, `centsToDisplay`, `formatBRL`.
- Dependency: `input-otp`.
- `// Domain` section in barrel and Storybook sidebar.

## [0.4.0] — 2026-05-17

### Added
- 8 forms components: calendar, combobox, date-input, date-range-picker, field, form, multi-select, select.
- React Hook Form integration via `form` + `field` wrappers.
- Dependencies: `@radix-ui/react-select`, `react-day-picker`, `react-hook-form`, `date-fns`.
- `// Forms` section in barrel and Storybook sidebar.

## [0.3.0] — 2026-05-17

### Added
- 6 navigation components: accordion, breadcrumb, command, dropdown-menu, sidebar, tabs.
- Hook: `useIsMobile`.
- Dependencies: `@radix-ui/react-accordion`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs`, `cmdk`.
- `// Navigation` section in barrel and Storybook sidebar.

## [0.2.0] — 2026-05-17

### Added
- 8 overlay components: alert, alert-dialog, dialog, popover, progress, sheet, sonner, tooltip.
- 1 composed component: confirm-button (extracted from prior `<Button confirm>` API).
- Dependencies: `@radix-ui/react-alert-dialog`, `@radix-ui/react-dialog`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-tooltip`, `sonner`.
- `// Overlays` and `// Composed` sections in barrel and Storybook sidebar.

## [0.1.0] — 2026-05-17

### Added
- 11 primitive components: avatar, badge, button, checkbox, input, label, radio-group, separator, skeleton, switch, textarea.
- `// Primitives` section in barrel and Storybook sidebar.

## [0.0.1] — 2026-05-16

### Added
- Project scaffold: Bun + tsup + Storybook 10 + Tailwind v4 + Biome.
- Token foundation: `tokens.css` (OKLCH palette, radius scale, light-only) and `fonts.css`.
- Helper: `cn` (clsx + tailwind-merge).
- Storybook foundation pages: Colors, Typography, Spacing, Radius, Iconography.
- Getting Started MDX page.
