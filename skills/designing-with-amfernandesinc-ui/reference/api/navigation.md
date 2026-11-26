<!-- Gerado por `bun run skill:api` a partir de src/. Não edite à mão: o teste scripts/lib/skill-api.test.ts falha se este arquivo e o código divergirem. -->

# API: Navegação

## `navigation/accordion` — `@amfernandesinc/ui/accordion`

### Accordion

`import { Accordion } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/accordion"`

As props são uma união: cada forma abaixo é um jeito de usar o componente.

#### `AccordionSingleProps`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `items` | `AccordionItemData[]` | **obrigatória** | — |
| `keepMounted` | `boolean` | `false` | Keep closed sections in the DOM, hidden, so what they hold survives closing them: in a long form with `type="single"`, opening section 2 no longer wipes the uncontrolled fields of section 1. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | Level of the heading that wraps each title, to fit the page outline (an accordion under an `<h2>` takes `3`; under an `<h3>`, `4`). |
| `ref` | `React.Ref<AccordionRootRef>` | — | — |
| `type` | `"single"` | — | — |
| `value` | `string` | — | — |
| `defaultValue` | `string` | — | — |
| `onValueChange` | `(value: string) => void` | — | — |
| `collapsible` | `boolean` | — | — |

Repassa também: props de `@radix-ui/react-accordion` (`AccordionImplProps`); props de `@radix-ui/react-primitive`; atributos HTML do React (`Attributes`, `HTMLAttributes`).

#### `AccordionMultipleProps`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `items` | `AccordionItemData[]` | **obrigatória** | — |
| `keepMounted` | `boolean` | `false` | Keep closed sections in the DOM, hidden, so what they hold survives closing them: in a long form with `type="single"`, opening section 2 no longer wipes the uncontrolled fields of section 1. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | Level of the heading that wraps each title, to fit the page outline (an accordion under an `<h2>` takes `3`; under an `<h3>`, `4`). |
| `ref` | `React.Ref<AccordionRootRef>` | — | — |
| `type` | `"multiple"` | **obrigatória** | — |
| `value` | `string[]` | — | — |
| `defaultValue` | `string[]` | — | — |
| `onValueChange` | `(value: string[]) => void` | — | — |

Repassa também: props de `@radix-ui/react-accordion` (`AccordionImplProps`); props de `@radix-ui/react-primitive`; atributos HTML do React (`Attributes`, `HTMLAttributes`).


### AccordionItemData

`import type { AccordionItemData } from "@amfernandesinc/ui"`

```ts
export interface AccordionItemData {
  value: string
  title: React.ReactNode
  content: React.ReactNode
  /** Optional element rendered on the right side of the header (e.g. delete button). */
  action?: React.ReactNode
  disabled?: boolean
}
```

### AccordionProps

`import type { AccordionProps } from "@amfernandesinc/ui"`

```ts
export type AccordionProps = AccordionSingleProps | AccordionMultipleProps
```

## `navigation/app-shell` — `@amfernandesinc/ui/app-shell`

### AppShell

`import { AppShell } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/app-shell"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `items` | `AppShellItem[]` | **obrigatória** | Menu entries. The only required prop. |
| `isActive` | `(item: AppShellItem) => boolean` | — | Mark the matching item as active (background accent + `aria-current="page"`). |
| `renderLink` | `RenderLink` | — | Renders the items that have `href` with your router's `<Link>`, so a click navigates without reloading the page: `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`. Pass every prop on: they carry the classes, `aria-current` and the click handler that closes the mobile menu. |
| `brand` | `React.ReactNode` | — | Logo shown in the menu header (32px box) and in the mobile bar (28px box). When `brandText` is present, give images an empty `alt` so the name is not read twice. |
| `brandText` | `React.ReactNode` | — | Product name shown next to `brand` while the menu is expanded. |
| `onBrandClick` | `() => void` | — | Turns `brand` into a button that calls this callback (e.g. "back to the list" on a detail page). Without it the brand is not interactive. |
| `navbar` | `React.ReactNode` | — | Fixed bar above the content. It has the same 64px height as the menu header, so the bottom borders line up. Its content is laid out in a flex row — use `ml-auto` to push items to the right. Below 768px it moves into the mobile bar, to the right of the brand. |
| `footer` | `React.ReactNode` | — | Free area at the bottom of the menu (account menu, sign-out, version…). The shell renders nothing there by itself. Read `useAppShell().collapsed` to adapt the content to the 64px icon rail. |
| `contentPadding` | `boolean` | `true` | Standard content padding: 24px on desktop and 16px below 768px. Pass `false` for edge-to-edge screens (maps, boards, full-bleed tables). |
| `collapsed` | `boolean` | — | The desktop menu is the 64px icon rail (controlled). Pair it with `onCollapsedChange`; you then own the persistence (per user, in your backend…) and `storageKey` is not used. |
| `onCollapsedChange` | `(collapsed: boolean) => void` | — | Called when the menu is collapsed or expanded (button or `useAppShell().toggle`). |
| `defaultCollapsed` | `boolean` | `true` | Initial collapsed state when the user never toggled the menu (the choice is persisted in localStorage, see `storageKey`). |
| `storageKey` | `string \| false` | `STORAGE_KEY` | localStorage key for the user's choice. Give each app (or user, or screen) its own; `false` keeps the choice only while the page is open. |
| `labels` | `Partial<AppShellLabels>` | — | Override any of the default pt-BR strings. |
| `className` | `string` | — | Classes for the root element. The shell fills the viewport (`h-dvh`); pass `"h-full"` to fill the parent instead (e.g. under an Electron title bar). |
| `children` | `React.ReactNode` | — | Page content, rendered inside `<main id="conteudo">` — the only area that scrolls. |
| `mainRef` | `React.Ref<HTMLElement>` | — | Ref to the `<main>` that scrolls. The page scrolls inside it, not the window, so give it to your router's scroll restoration (or call `mainRef.current.scrollTo(0, 0)` on navigation). |

### useAppShell

`import { useAppShell } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/app-shell"`

Shell state for content rendered inside `<AppShell>` (navbar, footer, page).

```ts
useAppShell(): AppShellState
```

### defaultAppShellLabels

`import { defaultAppShellLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/app-shell"`

```ts
const defaultAppShellLabels: AppShellLabels = {
  skipToContent: "Pular para o conteúdo",
  navigation: "Navegação principal",
  menu: "Menu",
  openMenu: "Abrir menu",
  closeMenu: "Fechar menu",
  collapse: "Recolher menu",
  expand: "Expandir menu",
  brandAction: "Voltar",
}
```

### AppShellItem

`import type { AppShellItem } from "@amfernandesinc/ui"`

Single shape for an AppShell menu entry. - `items` (children) turns the entry into an expandable group: clicking toggles a submenu of links indented below it. Only one nesting level is supported by design. - `type: "section"` with `items` is a titled section instead: the title is not clickable and the items are always shown below it. - `href` makes it a navigation anchor; `onClick` makes it a button-style item. Mutually exclusive in practice. - `badge` renders as a chip on the right when expanded and as a dot in the collapsed (icon-only) rail.

```ts
export interface AppShellItem {
  /** Stable identity (React key + `isActive` lookups). */
  id: string
  /**
   * `"section"`: a title over its `items` ("Vendas", "Cadastros"), announced
   * as the name of their list. In the rail it becomes a divider.
   * @default "item"
   */
  type?: "item" | "section"
  label: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  /**
   * Navigation URL. Values that don't resolve to an `http:`/`https:`/
   * `mailto:`/`tel:` URL (e.g. `javascript:` or `vbscript:`) are dropped —
   * the item then renders as a non-anchor button. `onClick` still fires
   * if provided.
   */
  href?: string
  /**
   * Runs on activation and receives the click event: on a link,
   * `event.preventDefault()` stops the navigation. Not called for a click the
   * browser handles by itself (Ctrl/⌘, Shift, Alt or the middle button open
   * the link elsewhere and the current page stays as it is).
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  /** Link target. `"_blank"` also sets `rel="noopener noreferrer"`. */
  target?: React.HTMLAttributeAnchorTarget
  badge?: React.ReactNode
  disabled?: boolean
  /**
   * Why a `disabled` item is unavailable ("Disponível para o perfil
   * Gestor"). Shown as a tooltip and read as the item's description; the
   * item then stays reachable by keyboard, so the reason can be found.
   */
  disabledReason?: string
  /** Nested children — turns the item into an expandable group. */
  items?: AppShellItem[]
  /**
   * Expand the submenu on mount when this item has children. A group also
   * opens by itself when one of its children is the current page (`isActive`).
   */
  defaultOpen?: boolean
}
```

### AppShellLabels

`import type { AppShellLabels } from "@amfernandesinc/ui"`

```ts
export interface AppShellLabels {
  /** Skip link that jumps to the page content. */
  skipToContent: string
  /** Accessible name of the `<nav>` that holds the items. */
  navigation: string
  /** Accessible title of the mobile menu dialog. */
  menu: string
  /** Mobile button that opens the menu. */
  openMenu: string
  /** Button that closes the mobile menu. */
  closeMenu: string
  /** Desktop button that collapses the menu to the icon rail. */
  collapse: string
  /** Desktop button that expands the icon rail back to the full menu. */
  expand: string
  /** Accessible name and tooltip of the brand when `onBrandClick` is set. */
  brandAction: string
}
```

### AppShellProps

`import type { AppShellProps } from "@amfernandesinc/ui"`

```ts
export interface AppShellProps {
  /** Menu entries. The only required prop. */
  items: AppShellItem[]
  /** Mark the matching item as active (background accent + `aria-current="page"`). */
  isActive?: (item: AppShellItem) => boolean
  /**
   * Renders the items that have `href` with your router's `<Link>`, so a
   * click navigates without reloading the page:
   * `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`.
   * Pass every prop on: they carry the classes, `aria-current` and the click
   * handler that closes the mobile menu.
   */
  renderLink?: RenderLink
  /**
   * Logo shown in the menu header (32px box) and in the mobile bar (28px box).
   * When `brandText` is present, give images an empty `alt` so the name is
   * not read twice.
   */
  brand?: React.ReactNode
  /** Product name shown next to `brand` while the menu is expanded. */
  brandText?: React.ReactNode
  /**
   * Turns `brand` into a button that calls this callback (e.g. "back to the
   * list" on a detail page). Without it the brand is not interactive.
   */
  onBrandClick?: () => void
  /**
   * Fixed bar above the content. It has the same 64px height as the menu
   * header, so the bottom borders line up. Its content is laid out in a flex
   * row — use `ml-auto` to push items to the right. Below 768px it moves into
   * the mobile bar, to the right of the brand.
   */
  navbar?: React.ReactNode
  /**
   * Free area at the bottom of the menu (account menu, sign-out, version…).
   * The shell renders nothing there by itself. Read `useAppShell().collapsed`
   * to adapt the content to the 64px icon rail.
   */
  footer?: React.ReactNode
  /**
   * Standard content padding: 24px on desktop and 16px below 768px. Pass
   * `false` for edge-to-edge screens (maps, boards, full-bleed tables).
   * @default true
   */
  contentPadding?: boolean
  /**
   * The desktop menu is the 64px icon rail (controlled). Pair it with
   * `onCollapsedChange`; you then own the persistence (per user, in your
   * backend…) and `storageKey` is not used.
   */
  collapsed?: boolean
  /** Called when the menu is collapsed or expanded (button or `useAppShell().toggle`). */
  onCollapsedChange?: (collapsed: boolean) => void
  /**
   * Initial collapsed state when the user never toggled the menu (the choice
   * is persisted in localStorage, see `storageKey`).
   * @default true
   */
  defaultCollapsed?: boolean
  /**
   * localStorage key for the user's choice. Give each app (or user, or
   * screen) its own; `false` keeps the choice only while the page is open.
   * @default "amf-ui:sidebar:collapsed"
   */
  storageKey?: string | false
  /** Override any of the default pt-BR strings. */
  labels?: Partial<AppShellLabels>
  /**
   * Classes for the root element. The shell fills the viewport (`h-dvh`);
   * pass `"h-full"` to fill the parent instead (e.g. under an Electron title bar).
   */
  className?: string
  /** Page content, rendered inside `<main id="conteudo">` — the only area that scrolls. */
  children?: React.ReactNode
  /**
   * Ref to the `<main>` that scrolls. The page scrolls inside it, not the
   * window, so give it to your router's scroll restoration (or call
   * `mainRef.current.scrollTo(0, 0)` on navigation).
   */
  mainRef?: React.Ref<HTMLElement>
}
```

### AppShellState

`import type { AppShellState } from "@amfernandesinc/ui"`

```ts
export interface AppShellState {
  /** `true` while the desktop menu is the 64px icon rail. Always `false` inside the mobile menu. */
  collapsed: boolean
  /** `true` below the `md:` breakpoint (48rem), same query as `useIsMobile`. */
  isMobile: boolean
  /** Closes the mobile menu. No-op when it is already closed. */
  closeMenu: () => void
  /** Collapses or expands the desktop menu, e.g. from a keyboard shortcut. */
  toggle: () => void
}
```

### SidebarItem

`import type { SidebarItem } from "@amfernandesinc/ui"`

```ts
export type SidebarItem = AppShellItem
```

## `navigation/breadcrumb` — `@amfernandesinc/ui/breadcrumb`

### Breadcrumb

`import { Breadcrumb } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/breadcrumb"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `items` | `BreadcrumbItemData[]` | **obrigatória** | — |
| `maxItems` | `number` | — | Show at most this many entries: the first one, a "…" button and the last `maxItems - 1`. The "…" opens a menu with the hidden entries, as plain links. No limit by default. |
| `labels` | `Partial<BreadcrumbLabels>` | — | — |
| `ariaLabel` | `string` | — | — |
| `renderLink` | `RenderLink` | — | Renders the links with your router's `<Link>`, so a click navigates without reloading the page: `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`. Pass every prop on: they carry the classes and the click handler. |
| `ref` | `React.Ref<HTMLElement>` | — | — |

Repassa também: atributos HTML do React (`Attributes`, `HTMLAttributes`).

### defaultBreadcrumbLabels

`import { defaultBreadcrumbLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/breadcrumb"`

```ts
const defaultBreadcrumbLabels: BreadcrumbLabels = {
  navigation: "Trilha de navegação",
  showHidden: "Mostrar itens ocultos da trilha",
}
```

### BreadcrumbItemData

`import type { BreadcrumbItemData } from "@amfernandesinc/ui"`

```ts
export interface BreadcrumbItemData {
  /** Display content for the breadcrumb entry. */
  label: React.ReactNode
  /**
   * Navigation URL. Omit for the current page. Values that don't resolve
   * to an `http:`/`https:`/`mailto:`/`tel:` URL (e.g. `javascript:` or
   * `vbscript:`) are dropped — the item then renders as plain text.
   */
  href?: string
  /**
   * Runs when the link is clicked and receives the event:
   * `event.preventDefault()` stops the navigation.
   */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  /** Marks the current page. Auto-detected as true when href is omitted on the last item. */
  isCurrentPage?: boolean
}
```

### BreadcrumbLabels

`import type { BreadcrumbLabels } from "@amfernandesinc/ui"`

```ts
export interface BreadcrumbLabels {
  /** Name of the `<nav>` landmark. */
  navigation: string
  /** Name of the "…" button that lists the items hidden by `maxItems`. */
  showHidden: string
}
```

### BreadcrumbProps

`import type { BreadcrumbProps } from "@amfernandesinc/ui"`

```ts
export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  items: BreadcrumbItemData[]
  /**
   * Show at most this many entries: the first one, a "…" button and the last
   * `maxItems - 1`. The "…" opens a menu with the hidden entries, as plain
   * links. No limit by default.
   */
  maxItems?: number
  labels?: Partial<BreadcrumbLabels>
  /** @deprecated Use `labels={{ navigation }}`. */
  ariaLabel?: string
  /**
   * Renders the links with your router's `<Link>`, so a click navigates
   * without reloading the page:
   * `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`.
   * Pass every prop on: they carry the classes and the click handler.
   */
  renderLink?: RenderLink
  ref?: React.Ref<HTMLElement>
}
```

## `navigation/command-palette` — `@amfernandesinc/ui/command-palette`

### CommandPalette

`import { CommandPalette } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/command-palette"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `open` | `boolean` | **obrigatória** | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `groups` | `CommandPaletteGroup[]` | **obrigatória** | — |
| `placeholder` | `string` | — | — |
| `emptyMessage` | `React.ReactNode` | — | — |
| `loading` | `boolean` | — | — |
| `title` | `string` | **obrigatória** | — |
| `description` | `string` | `""` | — |
| `search` | `string` | — | The search term typed in the field (controlled). Pair it with `onSearchChange`; leave both out and the palette keeps the term itself. |
| `onSearchChange` | `(search: string) => void` | — | Called with the typed term on every change. For a server search (a lead by CPF, a contract by number) fetch with it, pass the results in `groups`, show `loading` meanwhile and set `shouldFilter={false}`. |
| `shouldFilter` | `boolean` | `true` | `false` turns the local filtering off: the palette shows exactly what `groups` holds, already filtered by your server for `search`. |
| `value` | `string` | — | The highlighted item, the one Enter would choose (arrow keys and the pointer move it). Not the search term: that is `search`. |
| `onValueChange` | `(value: string) => void` | — | Called when the highlighted item changes. See `value`. |
| `closeOnSelect` | `boolean` | `true` | Close the palette (`onOpenChange(false)`) once an item is chosen, after its `onSelect`. Set `false` for a palette that stays open between commands. |
| `labels` | `Partial<CommandPaletteLabels>` | — | Override individual UI strings. Defaults are pt-BR. The standalone `placeholder` and `emptyMessage` props still win when provided. |

### defaultCommandPaletteLabels

`import { defaultCommandPaletteLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/command-palette"`

```ts
const defaultCommandPaletteLabels: CommandPaletteLabels = {
  placeholder: "Buscar...",
  emptyMessage: "Nenhum resultado",
  loading: "Carregando…",
  list: "Resultados",
}
```

### CommandPaletteGroup

`import type { CommandPaletteGroup } from "@amfernandesinc/ui"`

```ts
export interface CommandPaletteGroup {
  heading?: React.ReactNode
  items: CommandPaletteItem[]
}
```

### CommandPaletteItem

`import type { CommandPaletteItem } from "@amfernandesinc/ui"`

```ts
export interface CommandPaletteItem {
  /**
   * Stable identity of the item: what `value`/`onValueChange` report for it.
   * Give one whenever two items can share a label ("Exportar" in two groups,
   * two clients with the same name); without it the label is used.
   */
  id?: string
  label?: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string
  onSelect: () => void
  disabled?: boolean
  render?: React.ReactNode
  keywords?: string[]
}
```

### CommandPaletteLabels

`import type { CommandPaletteLabels } from "@amfernandesinc/ui"`

```ts
export interface CommandPaletteLabels {
  /** Search input placeholder. */
  placeholder: string
  /** Empty-state message shown when no item matches the search. */
  emptyMessage: React.ReactNode
  /**
   * Loader text rendered when `loading={true}`. When it is a string it also
   * names the progress bar for screen readers.
   */
  loading: React.ReactNode
  /** Accessible name of the list of results (screen readers only). */
  list: string
}
```

### CommandPaletteProps

`import type { CommandPaletteProps } from "@amfernandesinc/ui"`

```ts
export interface CommandPaletteProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  groups: CommandPaletteGroup[]
  placeholder?: string
  emptyMessage?: React.ReactNode
  loading?: boolean
  title: string
  description?: string
  /**
   * The search term typed in the field (controlled). Pair it with
   * `onSearchChange`; leave both out and the palette keeps the term itself.
   */
  search?: string
  /**
   * Called with the typed term on every change. For a server search (a lead
   * by CPF, a contract by number) fetch with it, pass the results in
   * `groups`, show `loading` meanwhile and set `shouldFilter={false}`.
   */
  onSearchChange?: (search: string) => void
  /**
   * `false` turns the local filtering off: the palette shows exactly what
   * `groups` holds, already filtered by your server for `search`.
   * @default true
   */
  shouldFilter?: boolean
  /**
   * The highlighted item, the one Enter would choose (arrow keys and the
   * pointer move it). Not the search term: that is `search`.
   */
  value?: string
  /** Called when the highlighted item changes. See `value`. */
  onValueChange?: (value: string) => void
  /**
   * Close the palette (`onOpenChange(false)`) once an item is chosen, after
   * its `onSelect`. Set `false` for a palette that stays open between
   * commands.
   * @default true
   */
  closeOnSelect?: boolean
  /**
   * Override individual UI strings. Defaults are pt-BR. The standalone
   * `placeholder` and `emptyMessage` props still win when provided.
   */
  labels?: Partial<CommandPaletteLabels>
}
```

## `navigation/pagination` — `@amfernandesinc/ui/pagination`

### Pagination

`import { Pagination } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/pagination"`

Standalone pagination for lists, cards and server-side tables. Works with a known total (`totalItems` / `totalPages`) or with cursors (`hasMore`).

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `page` | `number` | **obrigatória** | Current page, 1-based. Out-of-range values are clamped for display and navigation. |
| `onPageChange` | `(page: number) => void` | **obrigatória** | — |
| `totalPages` | `number` | — | Number of pages, when you know it but not the item count. |
| `totalItems` | `number` | — | Number of items. With `pageSize` it gives the page count and a range summary ("11–20 de 243"). Takes precedence over `totalPages`. |
| `pageSize` | `number` | `10` | — |
| `pageSizeOptions` | `number[]` | — | Shows a page-size select. Changing it calls `onPageSizeChange` and goes back to page 1. |
| `onPageSizeChange` | `(pageSize: number) => void` | — | — |
| `hasMore` | `boolean` | `false` | Cursor pagination (total unknown): only previous/next are shown, and next is enabled while `hasMore` is true. Used when neither `totalItems` nor `totalPages` is given. |
| `variant` | `"pages" \| "compact"` | `"pages"` | `pages`: numbered buttons with ellipses. `compact`: "Página 3 de 10" between previous and next. |
| `siblingCount` | `number` | `1` | Pages shown on each side of the current one. |
| `showFirstLast` | `boolean` | `false` | Also show first/last page buttons. In a container narrower than 320px they give way, and previous/next remain. |
| `getPageHref` | `(page: number) => string` | — | Render real links instead of buttons (`?page=3` URLs, crawlable, open in a new tab). `onPageChange` still fires, right after the browser follows the link, except for a click that opens it elsewhere (Ctrl/⌘, Shift or the middle button): this page then stays where it is. Unsafe protocols fall back to buttons. |
| `renderLink` | `RenderLink` | — | With `getPageHref`, renders the links with your router's `<Link>`, so a page change does not reload the page: `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`. Pass every prop on: they carry the classes, `aria-current` and the click handler that reports the page. |
| `disabled` | `boolean` | `false` | — |
| `size` | `"sm" \| "md"` | `"md"` | `md` = 40px controls (the `Button` height), `sm` = 32px. |
| `labels` | `Partial<PaginationLabels>` | — | — |
| `className` | `string` | — | — |

### getPaginationItems

`import { getPaginationItems } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/pagination"`

Page numbers to show. Always the same number of slots (first, last, current ± siblings and two ellipses) so the control never changes width while paging. An ellipsis only replaces two or more pages — a single hidden page is shown instead.

```ts
getPaginationItems(page: number, totalPages: number, siblingCount = 1): PageItem[]
```

### defaultPaginationLabels

`import { defaultPaginationLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/pagination"`

```ts
const defaultPaginationLabels: PaginationLabels = {
  navigation: "Paginação",
  previous: "Página anterior",
  next: "Próxima página",
  first: "Primeira página",
  last: "Última página",
  page: (page) => `Página ${fmt(page)}`,
  pageOf: (page, total) => `Página ${fmt(page)} de ${fmt(total)}`,
  range: (from, to, total) => `${fmt(from)}–${fmt(to)} de ${fmt(total)}`,
  pageSize: "Itens por página",
}
```

### PaginationLabels

`import type { PaginationLabels } from "@amfernandesinc/ui"`

```ts
export interface PaginationLabels {
  /** Accessible name of the `<nav>` landmark. */
  navigation: string
  previous: string
  next: string
  first: string
  last: string
  /** Accessible name of a page button/link, and the cursor-mode indicator. */
  page: (page: number) => string
  /** Indicator of the `compact` variant. */
  pageOf: (page: number, total: number) => string
  /** Summary shown when `totalItems` is known ("11–20 de 243"). */
  range: (from: number, to: number, total: number) => string
  /** Visible label (and accessible name) of the page-size select. */
  pageSize: string
}
```

### PaginationProps

`import type { PaginationProps } from "@amfernandesinc/ui"`

```ts
export interface PaginationProps {
  /** Current page, 1-based. Out-of-range values are clamped for display and navigation. */
  page: number
  onPageChange: (page: number) => void
  /** Number of pages, when you know it but not the item count. */
  totalPages?: number
  /**
   * Number of items. With `pageSize` it gives the page count and a range
   * summary ("11–20 de 243"). Takes precedence over `totalPages`.
   */
  totalItems?: number
  /** @default 10 */
  pageSize?: number
  /** Shows a page-size select. Changing it calls `onPageSizeChange` and goes back to page 1. */
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
  /**
   * Cursor pagination (total unknown): only previous/next are shown, and
   * next is enabled while `hasMore` is true. Used when neither `totalItems`
   * nor `totalPages` is given.
   */
  hasMore?: boolean
  /**
   * `pages`: numbered buttons with ellipses. `compact`: "Página 3 de 10"
   * between previous and next.
   * @default "pages"
   */
  variant?: "pages" | "compact"
  /** Pages shown on each side of the current one. @default 1 */
  siblingCount?: number
  /**
   * Also show first/last page buttons. In a container narrower than 320px
   * they give way, and previous/next remain. @default false
   */
  showFirstLast?: boolean
  /**
   * Render real links instead of buttons (`?page=3` URLs, crawlable, open in
   * a new tab). `onPageChange` still fires, right after the browser follows
   * the link, except for a click that opens it elsewhere (Ctrl/⌘, Shift or
   * the middle button): this page then stays where it is. Unsafe protocols
   * fall back to buttons.
   */
  getPageHref?: (page: number) => string
  /**
   * With `getPageHref`, renders the links with your router's `<Link>`, so a
   * page change does not reload the page:
   * `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`.
   * Pass every prop on: they carry the classes, `aria-current` and the click
   * handler that reports the page.
   */
  renderLink?: RenderLink
  disabled?: boolean
  /** `md` = 40px controls (the `Button` height), `sm` = 32px. @default "md" */
  size?: "sm" | "md"
  labels?: Partial<PaginationLabels>
  className?: string
}
```

## `navigation/stepper` — `@amfernandesinc/ui/stepper`

### Stepper

`import { Stepper } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/stepper"`

Numbered sequence of steps for multi-step flows (cadastro, proposta, checkout). Shows where the user is, what is done and what is left. Data-driven: describe the steps in `steps` and set `activeStep`. With `onStepClick`, steps become buttons (non-linear navigation). Horizontal steppers collapse to a compact "Etapa 2 de 5 · Endereço" summary when the container is too narrow.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `steps` | `StepperStep[]` | **obrigatória** | — |
| `activeStep` | `number` | **obrigatória** | Zero-based index of the current step. Steps before it are completed; `steps.length` marks every step as completed. |
| `onStepClick` | `(index: number) => void` | — | Enables non-linear navigation: every enabled step becomes a button. |
| `isStepClickable` | `(index: number) => boolean` | `every step that is not 'disabled'` | With `onStepClick`, which steps can be chosen. The usual wizard lets you go back but not skip ahead: `isStepClickable={(i) => i < activeStep}`. The other steps are shown as they are, not dimmed like `disabled` ones. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | — |
| `keepMounted` | `boolean` | `false` | Vertical only: keep every step's `content` in the DOM, hidden while it is not the current step, so uncontrolled fields keep what was typed when the user goes back. |
| `labels` | `Partial<StepperLabels>` | — | — |
| `className` | `string` | — | — |

### defaultStepperLabels

`import { defaultStepperLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/stepper"`

```ts
const defaultStepperLabels: StepperLabels = {
  label: "Progresso",
  optional: "Opcional",
  completed: "concluída",
  current: "etapa atual",
  error: "com erro",
  warning: "com alerta",
  stepOf: (step, total) => `Etapa ${step} de ${total}`,
  previousStep: "Etapa anterior",
  nextStep: "Próxima etapa",
}
```

### StepperLabels

`import type { StepperLabels } from "@amfernandesinc/ui"`

```ts
export interface StepperLabels {
  /** Accessible name of the list of steps. */
  label: string
  optional: string
  completed: string
  current: string
  error: string
  warning: string
  stepOf: (step: number, total: number) => string
  previousStep: string
  nextStep: string
}
```

### StepperProps

`import type { StepperProps } from "@amfernandesinc/ui"`

```ts
export interface StepperProps {
  steps: StepperStep[]
  /**
   * Zero-based index of the current step. Steps before it are completed;
   * `steps.length` marks every step as completed.
   */
  activeStep: number
  /** Enables non-linear navigation: every enabled step becomes a button. */
  onStepClick?: (index: number) => void
  /**
   * With `onStepClick`, which steps can be chosen. The usual wizard lets you
   * go back but not skip ahead: `isStepClickable={(i) => i < activeStep}`.
   * The other steps are shown as they are, not dimmed like `disabled` ones.
   * @default every step that is not `disabled`
   */
  isStepClickable?: (index: number) => boolean
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical"
  /**
   * Vertical only: keep every step's `content` in the DOM, hidden while it is
   * not the current step, so uncontrolled fields keep what was typed when
   * the user goes back.
   * @default false
   */
  keepMounted?: boolean
  labels?: Partial<StepperLabels>
  className?: string
}
```

### StepperStep

`import type { StepperStep } from "@amfernandesinc/ui"`

```ts
export interface StepperStep {
  /**
   * Stable identity of the step. Give one when steps come and go at runtime
   * (a "Cônjuge" step that appears for married buyers): the other steps keep
   * their content instead of shifting by position.
   */
  id?: string
  label: string
  description?: React.ReactNode
  /** Appends "Opcional" after the label. */
  optional?: boolean
  disabled?: boolean
  /** Overrides the progress colours: an error or a warning on this step. */
  status?: "error" | "warning"
  /** Vertical only: content shown under the active step (e.g. its form fields). */
  content?: React.ReactNode
}
```

## `navigation/tabs` — `@amfernandesinc/ui/tabs`

### Tabs

`import { Tabs } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/tabs"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `items` | `TabsItemData[]` | **obrigatória** | — |
| `keepMounted` | `boolean` | `false` | Keep the panels in the DOM, hidden while inactive, so what they hold survives a tab switch: an uncontrolled form, table filters, an upload in progress. Without it a panel is unmounted when you leave it. |
| `lazy` | `boolean` | `false` | With `keepMounted`, mount each panel on its first visit (and keep it from then on) instead of all at once. Without `keepMounted` only the active panel is ever mounted, `lazy` or not. |
| `ref` | `React.Ref<React.ComponentRef<typeof TabsPrimitive.Root>>` | — | — |
| `aria-label` | `string` | — | Accessible name of the list of tabs ("Seções do lead"). |
| `aria-labelledby` | `string` | — | Id of a visible title that names the list of tabs. |

Repassa também: props de `@radix-ui/react-primitive`; props de `@radix-ui/react-tabs` (`TabsProps`); atributos HTML do React (`Attributes`, `HTMLAttributes`).

### TabsItemData

`import type { TabsItemData } from "@amfernandesinc/ui"`

```ts
export interface TabsItemData {
  value: string
  label: React.ReactNode
  content: React.ReactNode
  badge?: React.ReactNode
  disabled?: boolean
}
```

### TabsProps

`import type { TabsProps } from "@amfernandesinc/ui"`

```ts
export interface TabsProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>, "children"> {
  items: TabsItemData[]
  /**
   * Keep the panels in the DOM, hidden while inactive, so what they hold
   * survives a tab switch: an uncontrolled form, table filters, an upload in
   * progress. Without it a panel is unmounted when you leave it.
   * @default false
   */
  keepMounted?: boolean
  /**
   * With `keepMounted`, mount each panel on its first visit (and keep it from
   * then on) instead of all at once. Without `keepMounted` only the active
   * panel is ever mounted, `lazy` or not.
   * @default false
   */
  lazy?: boolean
  ref?: React.Ref<React.ComponentRef<typeof TabsPrimitive.Root>>
  /** Accessible name of the list of tabs ("Seções do lead"). */
  "aria-label"?: string
  /** Id of a visible title that names the list of tabs. */
  "aria-labelledby"?: string
}
```
