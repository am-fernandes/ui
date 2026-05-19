# Changelog

All notable changes to `@am-fernandes/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [10.0.0] — 2026-05-18

**First public release.** This is the inaugural published API of `@am-fernandes/ui` on npm.

The library was iterated privately to ~145 exports (v9.x), then audited (Google Engineering Practices, OWASP Top 10:2025, Clean Code) and simplified before publication. Post-publication, three further breaking removals tightened the surface: `Chart*` (consumers use `recharts` directly), the `Form`/`Field`/`FieldGroup`/`FormField` wrappers (consumers use `react-hook-form` directly), and `DropdownMenu` (no internal consumer). The release represents the final API decisions: data-driven where it fits, `label`/`description`/`error` on every form control, `title`/`description`/`children` on every overlay, single-export for every flat component, `ReactNode` slots (`footer`, `headerAction`, `action`, `trigger`) for the common edge cases.

### Public API surface (41 components + 19 helpers/constants)

**Primitives (11):** `Avatar`, `Badge` (+`badgeVariants`), `Button` (+`buttonVariants`), `Checkbox`, `Input`, `RadioGroup`, `Separator`, `Skeleton`, `Switch`, `Textarea`, `Typography` (+`typographyVariants`)

**Overlays (9):** `Alert` (+`alertVariants`), `AlertDialog`, `Collapsible`, `Dialog`, `Popover`, `Progress`, `Sheet`, `Toaster`/`toast` (sonner), `Tooltip`

**Forms (5):** `Calendar`, `Combobox` (+`useComboboxOptions`), `DateInput`, `DateRangePicker`, `TimePicker`

**Navigation (5):** `Accordion`, `Breadcrumb`, `CommandPalette`, `Sidebar`, `Tabs`

**Data (6):** `Card`, `DataTable`, `Image`, `ScrollArea`, `Tree`, `Video` (+`tableStyles` helper)

**Domain (5):** `CurrencyInput`, `FileUpload`, `InputOTP` (+`REGEXP_ONLY_DIGITS`), `MultiInput`, `PercentageInput`

**Hooks (1):** `useIsMobile`

**Lib (10):** `cn`, `toCents`, `fromCents`, `centsToDisplay`, `formatBRL`, `percentFromValue`, `percentOfTotal`, `bytes`/`kb`/`mb`/`gb`

> See the Storybook **Hooks** tab for the canonical reference on every non-component export (signatures, examples, SSR notes).

### Quality posture

- 346 unit/integration tests pass (jsdom + @testing-library/react via vitest)
- 289 Storybook stories smoke-tested via `@storybook/test-runner` (Chromium real, Axe wcag2aa assertions, 0 serious/critical violations)
- 96 Playwright E2E tests across desktop + mobile (Pixel 5) + tablet (iPad gen 7) viewports
- 57 visual regression baselines via `toHaveScreenshot` (Google Fonts blocked for determinism)
- typecheck clean
- lint clean (biome)
- React 19 native `ref` prop pattern across all components (no `forwardRef`)
- `data-slot` attribute on every primary element
- WCAG 2.4.7 focus rings on every interactive primitive
- Radix Dialog title always present (CommandPalette uses sr-only defaults)
- Image/Video validate src against allowed protocols
- Sidebar cookie persistence is opt-in (`persistOpenState`)
- FileUpload documents MIME validation as browser-supplied (server must re-validate)
- Tree implements full WAI-ARIA tree pattern (roving tabindex, arrow keys, Home/End)

### Post-publication breaking changes folded into 10.0.0

- **Removed `Chart*` family** — consumers use `recharts` directly. The library still ships `--chart-1` … `--chart-5` tokens (see Foundations/Colors).
- **Removed `Form`, `FormField`, `Field`, `FieldGroup`** — consumers use `react-hook-form` directly. `Combobox`, `DateInput`, etc. already expose `label`/`description`/`error` props, so a `<Field>` wrapper was redundant.
- **Removed `DropdownMenu`** — no internal consumer and removed Radix `@radix-ui/react-dropdown-menu` from deps. Use `Popover` + `Button` when an action menu is required.
- **Unexported `Sheet*` subcomponents** — `Sheet` remains exported, but the lower-level Radix subcomponents (`SheetTrigger`/`SheetContent`/etc.) are no longer part of the public API. The flat `<Sheet title description children>` API is the supported entrypoint; `Sidebar` consumes Sheet internals directly.

### Previous private iterations

Versions 1.0–9.0 were never published to npm — they were in-repo iterations. The audit pass that produced this release is documented in `docs/superpowers/specs/2026-05-18-api-simplification-design.md` and `docs/superpowers/plans/2026-05-18-api-simplification.md`.

---

## Internal history (pre-public)

> Versions below were in-repo only — never published.

### [v9.0.0 private] — 2026-05-18

### Breaking
- **`React.forwardRef` removed across the library.** All components now use the React 19 native `ref` prop pattern (function components accepting `ref?: React.Ref<...>`). Consumers wrapping these in `forwardRef`-aware HOCs may see slightly different types. The ref behavior is preserved.
- **`DateInput`/`DateRangePicker`/`Calendar` — `parseISO` replaced with `parse(value, "yyyy-MM-dd", new Date())`.** Fixes the off-by-one timezone bug where the ISO date was parsed as UTC midnight and reformatted in local time. Stored ISO strings are now interpreted in local time, matching what the user sees.
- **`Calendar.data-day` now uses ISO `yyyy-MM-dd`** instead of locale-formatted strings. Selectors `[data-day="2025-01-15"]` are now stable across locales.
- **`InputOTP` defaults `pattern` to `REGEXP_ONLY_DIGITS`.** Non-digit characters are rejected by default. Pass an explicit `pattern` to opt into alphanumeric. `REGEXP_ONLY_DIGITS` is now re-exported from `@am-fernandes/ui`.
- **`Sidebar` no longer persists state to a cookie by default.** Opt-in via `<SidebarProvider persistOpenState />`. When enabled, the cookie is written with `SameSite=Lax; Secure` and only in uncontrolled mode.
- **`Sidebar` keyboard shortcut (`Ctrl/Cmd+B`) skips editable elements** and accepts a `keyboardShortcut?: string | null` prop (pass `null` to disable).
- **`Label` no longer uses `cva`** — it had no variants. The `VariantProps<typeof labelVariants>` type is gone.
- **`Typography.as` now restricted** to a curated union of intrinsic elements (`div | span | p | h1…h6 | label | small | blockquote`) instead of all `JSX.IntrinsicElements`.
- **`MultiInput`** added `maxItems?: number` and `onReject?: (reason) => void` props.

### Security
- **`Chart`** — `ChartStyle` sanitizes config `color` values before interpolating into the inline `<style>` block. Previously a malicious string could inject arbitrary CSS.
- **`Image` and `Video`** — added `allowedProtocols?: string[]` prop (default `["http:", "https:"]`). `src` values failing the allowlist (e.g. `javascript:`, `data:`) render the error fallback instead of issuing the network request.
- **`FileUpload`** — JSDoc warning on `accept` documenting that MIME validation is browser-supplied and is NOT a security boundary. Always re-validate on the server with magic-byte sniffing.

### Fixed — correctness
- **`CurrencyInput`/`PercentageInput`** — input digits clamped to 15 chars to avoid `Number.parseInt` overflowing `MAX_SAFE_INTEGER`.
- **`PercentageInput`** — values clamped to `[0, max]` (default `max=100`). Out-of-range pastes no longer pass silently.
- **`TimePicker`** — eliminated the `useEffect` race that could wipe user input mid-typing. Modular arrow-key wrap. Out-of-range blur clears the field instead of silently clamping (typing `25` no longer becomes `23`).
- **`Progress`** — value clamped to `[0, 100]`. Indeterminate state (when `value` is `undefined`) renders an animated indicator.
- **`Breadcrumb`** — `aria-current="page"` only on the last item.
- **`Sidebar.SidebarMenuSkeleton`** — replaced `Math.random()` with a deterministic hash of `useId()`. Fixes hydration mismatch in SSR.
- **`Tree`** — added `maxDepth?: number` (default `64`) and cycle detection. Recursive structures and overly deep trees no longer crash the renderer.
- **`Tree`** — implements the WAI-ARIA tree pattern: roving tabindex, arrow-key navigation, Home/End, Enter/Space activation, `aria-selected` on the focused row.
- **`FileUpload.fileMatchesAccept`** — extension patterns require a non-empty stem (a file literally named `.pdf` no longer matches the `.pdf` filter).
- **`FileUpload.openInNewTab`** — object URLs tracked in a ref and revoked on unmount; if `window.open` returns `null` (popup blocked) the URL is revoked immediately.

### Fixed — accessibility
- **`Button`/`Checkbox`/`Switch`/`Textarea`/`Tabs`** — restored `focus-visible` rings (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`). Previously `focus-visible:outline-none` was declared without a replacement — WCAG 2.4.7 violation.
- **`Input`/`Textarea`** — added `aria-invalid` styling.
- **`Checkbox`** — indeterminate state now renders a Minus icon.
- **`CommandDialog`** — includes `sr-only` `<DialogTitle>` and `<DialogDescription>`. Customize via `title`/`description` props.
- **`Combobox`** — added `aria-controls`/`aria-haspopup="listbox"`/`aria-autocomplete="list"` on the trigger. Replaced `__create__` string prefix with a cmdk internal action discriminator.
- **`Skeleton`** — defaults `role="status"`, `aria-live="polite"`, `aria-busy="true"`.
- **`DataTable`** — `aria-sort` on `<TableHead>`; sort button `aria-label` checks header type before stringifying.
- **`ScrollArea`** — added `orientation?: "vertical" | "horizontal" | "both"` prop.
- **`Calendar`** chevron icons — `aria-hidden="true"` set; SVGs no longer spread arbitrary props.

### Fixed — design
- **Overlay animation classes deduplicated.** `Dialog`/`AlertDialog`/`Sheet` now share `dialogContentBase` from `src/overlays/_internal/animations.ts`.
- **`Alert`** — fixed ref/prop generics. `AlertTitle` typed as `HTMLHeadingElement`; `AlertDescription` typed as `HTMLDivElement`. Fixed `[&>svg+*]` selector so icon + title vertical alignment works.
- **`Dialog`/`Sheet`** — `hideCloseButton?: boolean` and `closeLabel?: string` props (default `"Close"`).
- **`DateInput`** — `disabled` no longer swaps the DOM element from `<Button>` to `<Input>`. Refs and identity are stable.
- **`DateRangePicker`** — added `value`/`onChange` controlled API (object `{from, to}`) alongside the split props. Added `disabled` and `numberOfMonths` props.
- **`DataTable`** — added controlled props: `sorting`/`onSortingChange`, `globalFilter`/`onGlobalFilterChange`, `pageIndex`/`onPaginationChange`/`pageCount`/`manualPagination`. Server-side data tables possible without a fork.
- **`Sonner`** — extended `toastOptions.classNames` to cover `warning`, `info`, and `loading` variants.

### Fixed — implementation
- **`Accordion`** — replaced the blanket `as any` cast with a discriminated dispatch on `type`. Last item gets `last:border-b-0`.
- **`Combobox`** — replaced `||` with `??` in `useComboboxOptions`. Replaced inline placeholder color with `text-muted-foreground`. Renamed `_value` parameter on `onValueChange` to `value`.
- **`Calendar`** — memoized the `components` map; DayButton/Root/Chevron identities are stable across renders, preventing focus loss on keyboard nav.
- **`FileUpload`** — added `ref?: React.Ref<HTMLInputElement>` forwarded to the hidden file input.
- **`MultiInput`** — removed the dead `onKeyDown` handler on the non-focusable wrapper. Badge X-remove fires on `mousedown` (before input blur) to avoid the race where blur committed pending input while the user clicked a token X.

### Tests
- Coverage increased from 112 → 297 tests across 49 files.
- Added test files for `lib/currency`, `hooks/use-is-mobile`, and `data/table`.
- `vitest.setup.ts` stubs `URL.createObjectURL`/`revokeObjectURL` for `FileUpload` tests.

### Internal
- New file: `src/overlays/_internal/animations.ts` — shared overlay animation constants.

## [9.0.0] — 2026-05-18

### Breaking
- Removed `DropdownMenu` (component, types, story, test). It was never imported by
  any consumer app and would have been used for "menu de ações da linha" style UI
  that we currently don't ship. Removed dep `@radix-ui/react-dropdown-menu`.
- Removed the `Sheet*` public exports (`Sheet`, `SheetTrigger`, `SheetContent`,
  `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose`)
  and the Storybook story/test. The `src/overlays/sheet.tsx` source file remains
  in-tree because `Sidebar` uses it internally for the mobile drawer — it is no
  longer part of the public API.

## [8.1.0] — 2026-05-18

### Changed
- Every component's Storybook autodocs now appends a **"Exemplo de uso"** fenced
  TSX code block showing the import from `@am-fernandes/ui` and a minimal usage
  snippet. Applied to all 44 stories across Primitives, Overlays, Navigation,
  Forms, Domain, and Data — matching the pattern that already existed in
  `Domain/FileUpload` ("Helpers de tamanho").

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
