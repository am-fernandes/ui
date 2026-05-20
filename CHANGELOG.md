# Changelog

All notable changes to `@amfernandesinc/ui` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Releases from this point forward are managed via [changesets](https://github.com/changesets/changesets).

## [Unreleased]

### ⚠ BREAKING CHANGES

- **`Typography`**: the `display` variant has been removed. Rename it to `heading`, which now resolves to `text-3xl` / 30px (down from `display`'s `text-4xl` / 36px). The remaining variants were also renamed and resized: `subtitle` is now `text-xl` (20px), a new `lead` variant lives at `text-base` (16px), and the standalone `label`/`mono`/`overline` variants are gone — apply those tones via `className` overrides on the matching size sibling.
- **`DataTable`**: per-column `enableSorting` is no longer honored. Pass `sortableColumns={[...columnIds]}` on the `<DataTable>` to whitelist which headers render the sort button. Tables that previously relied on the implicit "everything sortable" default must now opt in explicitly. The controlled `sorting` / `onSortingChange` props were also removed in a follow-up — sort state is internal-only; reintroduce controlled sort via a future `defaultSorting` prop if needed.
- **`DateRangePicker`**: `onChange` was renamed to `onValueChange` for parity with every other form control (`Combobox`, `MultiInput`, `CurrencyInput`, `PercentageInput`, `RadioGroup`, `InputOTP`, `FileUpload`, …). The callback signature is unchanged — it still receives a `{ from, to }` `DateRangeValue`. Inside react-hook-form `Controller`, only the prop name changes: `onValueChange={field.onChange}`.

### Added

#### Brazilian inputs and validators
- `CPFInput` — masked `000.000.000-00` input, emits 11 cleaned digits.
- `CNPJInput` — masked `00.000.000/0000-00` input, emits 14 cleaned digits.
- `CEPInput` — masked `00000-000` input, emits 8 cleaned digits.
- `PhoneInput` — dynamic mask `(00) 0000-0000` ↔ `(00) 00000-0000` based on digit count (fixo vs celular).
- `isValidCPF`, `isValidCNPJ`, `isValidCEP`, `isValidPhone` — pure validators in `@amfernandesinc/ui/lib/brazil`. Canonical Receita Federal modulo-11 DV checks; reject all-same-digit and out-of-range area codes.

#### i18n labels
- `labels?: Partial<XLabels>` prop on `DataTable`, `FileUpload`, `Combobox`, `CommandPalette`, and `Calendar`. All keys optional, pt-BR defaults preserved, per-instance override (no global Provider).
- Exported label types and default constants: `DataTableLabels` / `defaultDataTableLabels` (13 keys: loading, empty, pagination prev/next, row count formatter, page indicator, sort-by, export trigger + 3 menu items, search placeholder + aria-label), `FileUploadLabels` / `defaultFileUploadLabels` (17 keys), `ComboboxLabels` / `defaultComboboxLabels` (7 keys), `CommandPaletteLabels` / `defaultCommandPaletteLabels` (3 keys), `CalendarLabels` (reserved for future wrapper copy — `react-day-picker`'s `locale` prop still drives day/month names).
- One `English` / `CustomLabels` story per component demonstrating the override pattern.

#### Tokens and motion
- Tiered z-index scale exposed as CSS variables: `--z-overlay` (40), `--z-modal` (50), `--z-popover` (60), `--z-tooltip` (70), `--z-toast` (80). Replaces the hardcoded `999999999` Sonner default.
- Motion duration tokens: `--motion-fast` (100ms), `--motion-default` (150ms), `--motion-slow` (200ms), `--motion-slowest` (300ms). Wired through Tooltip/Popover/Dialog/AlertDialog/Sheet.
- Global `@media (prefers-reduced-motion: reduce)` override so motion-sensitive users get effectively-instant transitions.
- `--font-mono` token (Geist Mono) applied to `InputOTP` slots (`font-mono` + `tabular-nums`) plus `tabular-nums` on `CurrencyInput` / `PercentageInput`.

#### Fonts
- Self-hosted Geist + Geist Mono via `@fontsource/geist` and `@fontsource/geist-mono` (only weights 400/500/600/700 sans, 400/500 mono). Drops Google Fonts CDN dependency (LGPD + render-blocking).
- Geist replaces the previous Google Sans Flex tagline as the default `--font-sans`.

#### DataTable improvements
- `loading` prop — replaces body rows with skeleton cells (count = `pagination.pageSize ?? 5`, rotating widths), swaps search input and footer for skeletons, disables pagination, sets `aria-busy="true"`.
- `downloadable` prop — renders an "Exportar para Excel" ghost button; opens a popover with three scopes (filtered / current page / all rows), each producing an `.xlsx` via lazy-imported `xlsx`. Accepts `boolean` or an object with `filename`, `sheetName`, `rowToRecord`.
- pt-BR thousands separator on `defaultRowCount` — large counts now render as "1.832 registros" via `Intl.NumberFormat("pt-BR")`.
- `onRowClick` + `rowClassName` props for interactive rows with inset focus rings.
- `dateColumn()` helper — dd/MM/yyyy auto-format plus timestamp-based `sortingFn` (handles BR strings, ISO, `Date` objects, epoch millis).
- New `Data/Table` simple story showcasing the `tableStyles()` helper for plain `<table>` markup.

#### DX and types
- Every public component now ships a typed `*Props` export: `CalendarProps`, `ProgressProps`, `SkeletonProps`, `ToasterProps`, `ScrollAreaProps`, `ScrollBarProps`, `LabelProps`. The internal `Label` used by `FieldShell` is renamed to `InternalLabelProps` to avoid collision.
- `asChild?: boolean` on `Badge` and `Label` (via `@radix-ui/react-slot`), matching the `Button` pattern. Lets consumers render as a `Link`, custom button, or arbitrary child while keeping the visual class set.
- Orphan types and values exported from the barrel: `DataTableDownloadable`, `DisabledDayPreset`, `DisabledDays`, `TypographyAs`, `ScrollBar`.
- `displayName` set on 10 previously-missing components: `Image`, `ScrollArea`, `Tree`, `Video`, `Progress`, `Toaster`, `Badge`, `Label`, `Skeleton`, `Typography`.
- `formatCount(count, max = 999)` helper for notification-style counter badges. Handles negative / NaN / Infinity / fractional inputs; renders `${max}+` past the cap.
- `Popover` exposes Radix outside-interaction callbacks: `onInteractOutside`, `onPointerDownOutside`, `onFocusOutside`, `onEscapeKeyDown` (types derived from `React.ComponentProps<typeof PopoverPrimitive.Content>`).
- Sidebar collapsible submenu with per-item `defaultOpen` flag.

#### Packaging
- Per-component subpath exports — `import { Button } from "@amfernandesinc/ui/button"` and pay only for what you use. The `exports` map grew from 3 entries to 53 (one per component + hooks + `lib/*` helpers + `./package.json`).
- `tsup` configured with `splitting: true` so shared helpers (`cn`, `cva`, `FieldShell`, `useFieldIds`, Radix re-exports) live in `chunk-*.js` and are deduped instead of inlined per entry. `sourcemap: false` drops ~354KB of `.map` files from the tarball — published size ~514KB → ~260KB.
- Subpath exports added for the Brazilian inputs and `./lib/brazil`.

### Changed

#### Spacing and density
- Inputs: vertical padding bumped to `py-3` across `Input`, `Textarea`, `CurrencyInput`, `PercentageInput`, `MultiInput`, `TimePicker`. Fixed `h-9` / `h-11` heights dropped — box height now flows from padding.
- `DateInput` trigger: aligned to `px-3 py-3`, no fixed height (matches sibling inputs).
- `Button`: `default` size goes `px-4` → `px-3` so buttons sit flush with inputs; `lg` size goes `px-8` → `px-6` (enterprise tooling, not landing-page hero).
- `DataTable`: cells move from `px-4 py-4` to `px-3 py-2.5`; footer gains `px-3` so its padding lines up with cells.
- Menu / tab / sidebar / tree rows unified at `py-1.5` (Tabs trigger: `py-1` → `py-1.5`).
- `space-y-*` swapped for `flex flex-col gap-*` on DataTable and FileUpload wrappers (matches the rest of the lib).
- `FileUpload` list rows: `px-3 py-2` → `px-2 py-1.5` (menu-item pattern).
- Icon spacing: `mr-*` margins removed inside `<Button>` (its base variant already declares `gap-2`); other flex parents gain `gap-2`/`gap-1` and lose per-icon margin (Combobox, CommandPalette, DateInput, DateRangePicker).

#### Tokens
- `--radius` flattened to `0.25rem` (4px) — every `--radius-{sm,md,lg,xl,2xl,3xl,4xl}` resolves to the same value. `rounded-full` is unaffected.
- Placeholder color routed through `--input` (the border color) — inputs, textareas, time picker, combobox, command palette all switch `placeholder:text-muted-foreground` → `placeholder:text-input`. The standalone `--placeholder` token introduced during the contrast pass was rolled back in favor of this unified low-emphasis tone.

#### Motion language
- Killed `transition-all` (anti-pattern: animates every property). `InputOTP` slot, Accordion trigger, Tabs trigger → `transition-colors`. Progress indicator → `transition-[width]`.
- Removed orphan `transition-[color]` from ScrollArea viewport.
- Chevron rotations normalized to default 150ms across Accordion, Sidebar, Tree (Accordion and Sidebar previously hardcoded `duration-200`).
- Added `transition-colors` to Tree rows, Sidebar menu items, Combobox options, CommandPalette items, and DataTable filter rows so every hoverable row in the lib feels consistent.
- Dialog backdrop and content both run at `--motion-slow` (backdrop was silently 150ms — desynced from 200ms content). Legacy slide classes (`slide-in-from-left-1/2`, `slide-in-from-top-[48%]`) dropped — dialogs are now pure fade + zoom-95.
- Sheet open and close both `--motion-slowest` (was asymmetric 500/300). Removes dead `ease-in-out` class.
- Tooltip gains `zoom-in-95` / `zoom-out-95` for parity with Popover.

### Fixed

#### Accessibility
- Sidebar disabled links are no longer keyboard-focusable or clickable (drop `href`, `tabIndex={-1}`, `aria-disabled`, `pointer-events-none`, intercept `onClick`). Active items announce `aria-current="page"` (links) / `"true"` (buttons).
- DataTable: inserts `sr-only role="status"` "Carregando dados…" during loading so VoiceOver/NVDA pick up the state transition. Empty-state text wrapped in `role="status" aria-live="polite"` so filter changes that flip row count to zero are announced.
- FileUpload: camera "Iniciando câmera…" wrapper gains `role="status"`.
- DateRangePicker trigger now mirrors `DateInput` (`aria-label`, `aria-describedby` via `useFieldIds`).
- TimePicker hour/minute inputs receive `aria-invalid` and `aria-describedby` pointing at FieldShell's error/description ids.
- InputOTP forwards `aria-invalid` and `aria-describedby` to OTPInput.
- CurrencyInput and PercentageInput forward `required` and `aria-required` to the underlying `<input>` (previously only the visual asterisk was set).

#### Contrast (WCAG AA hardening)
- `--destructive`: oklch(.628 .258 29.2) → oklch(.55 .19 29.2). Pure red (#ff0000) failed 4.5:1 on white text and on white background; the new deep red (#c93125) clears AA at 5.33:1.
- `--info`: oklch(.668 .151 236.3) → oklch(.5 .15 236.3). Light blue failed at 2.93:1 on white; the new corporate blue (#006cac) clears AA at 5.61:1.
- (Interim) introduced a `--placeholder` token at 4.85:1 on white, then folded the same role into `--input` — see _Changed → Tokens_ above.
- Drops the `color-contrast` a11y override on the `Typography` `WithClassName` story (the underlying issue is now fixed).

#### Focus rings (2-tier system finalized)
- **Tier 1 (fields)** — single rule across `Input`, `Textarea`, `CurrencyInput`, `PercentageInput`, `MultiInput`: `focus-within:border-primary focus-within:ring-1 focus-within:ring-ring`. Error state collapses to persistent red border + red ring on focus (previously three different behaviors).
- **Tier 2 (active controls)** — `Sheet` close button (was missing both `ring-ring` and `ring-offset-2` — rendered colorless ring), `Dialog` close button, Collapsible trigger, FileUpload thumbnail all gain `ring-offset-2`.
- RadioGroup migrated from Radix-v2 soft ring (`ring-[3px] ring-ring/50`) to the Tier 2 standard.
- ScrollArea viewport moved to Tier 1 (`ring-1`) — it's a content surface, not a control.
- DataTable interactive rows gain an inset focus ring (`focus-visible:ring-2 ring-ring ring-inset`) — the previous `focus-visible:bg-muted/60` was invisible against zebra stripes or hovered backgrounds.

#### Disabled state
- FieldShell wrapper and Label peer-disabled normalized to `opacity-50` (was `opacity-60` and `opacity-70` respectively).
- Removed inner `disabled:opacity-50` duplication on `Input`, `Textarea`, `MultiInput`, `TimePicker`, `CurrencyInput`, `PercentageInput` — FieldShell is now the sole owner of the visual fade (was compounding to 0.25 effective opacity).
- DateInput dropped `bg-muted` on disabled — every other field just fades; DateInput was the lone outlier painting a grey background.

#### Interactivity (post-Tailwind-v4 Preflight regression)
- Tailwind v4 dropped the default `cursor: pointer` on `<button>` — every Button in the lib was rendering the default arrow on hover. Restored on `Button` base (covers all variants), `Checkbox`, `RadioGroup` (parity with `Switch`), DataTable filter menu items + sort header, Combobox tag close + clear-all wrappers, Sidebar item base, Sheet/Dialog close buttons, Collapsible trigger.
- Hover semantics: Tabs inactive triggers gain `hover:bg-background/50` (previously no hover feedback). Combobox tag close switches to `hover:bg-secondary-foreground/20` for visible feedback over the `bg-muted` Badge. Combobox clear-all gains wrapper hover (was relying on icon-pixel-only `hover:opacity-100`). DataTable sort header gains `transition-colors` for smooth hover.

#### DateRangePicker
- Popover no longer closes prematurely while clicking inside the Calendar grid. Uses the new Popover `onInteractOutside` / `onFocusOutside` callbacks to detect clicks on `role="grid"`, `.rdp`, or `.rdp-root` and keep itself open.

### Removed

- Standalone Typography variants `label`, `mono`, `overline` — folded into same-size siblings; use `className` to apply the tonal overrides.
- `DataTable` `sorting` / `onSortingChange` controlled props (see _Breaking Changes_).
- Per-column `enableSorting` flag on DataTable columnDefs (see _Breaking Changes_).
- `bg-muted` disabled background on `DateInput`.
- Inline `disabled:opacity-50` rules on fields wrapped by FieldShell.
- Hardcoded Sonner `zIndex: 999999999` (now uses `var(--z-toast)`).
- `transition-all` from `InputOTP` slot, Accordion trigger, Tabs trigger.
- `transition-[color]` from ScrollArea viewport.
- Fixed `h-9` / `h-11` heights on input wrappers.
- The dead `ease-in-out` transition class on Sheet (never affected `@keyframes`).
- `sourcemap` output from the published tarball (~354KB saved).

### Internal

- `scripts/oklch-contrast.ts` — one-shot OKLCH → WCAG audit utility for verifying contrast ratios when tweaking the palette.
- `vitest.config.ts` — added `docs/**` to the exclude list so the component-template skeleton isn't run as a real test.
- New `CONTRIBUTING.md` (pt-BR) and `docs/component-template/` (copy-paste skeleton for a new field component).
- New `src/docs/FormIntegration.mdx` + `src/docs/_examples/rhf-form.stories.tsx` — Storybook page documenting react-hook-form integration (controlled-vs-uncontrolled audit, Controller recipes, error wiring, zod snippet, pitfalls).

### Migration guide

- **Typography**: `variant="display"` → `variant="heading"` (note: this also shrinks from 36px to 30px). If you specifically need 36px, set the size via `className` on `variant="heading"`.
- **DataTable sorting**: remove `enableSorting: false` from your `columnDef`s and pass `sortableColumns={["columnId", ...]}` on the `<DataTable>`. Drop any external `sorting` / `onSortingChange` wiring — sort state is now internal.
- **DateRangePicker**: rename the prop. `<DateRangePicker onChange={fn} />` → `<DateRangePicker onValueChange={fn} />`. Inside react-hook-form `Controller`: `onChange={field.onChange}` → `onValueChange={field.onChange}`.

## [0.0.2] — 2026-05-19

Initial private release. Subsequent history is tracked above.

[Unreleased]: https://github.com/am-fernandes/ui/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/am-fernandes/ui/releases/tag/v0.0.2
