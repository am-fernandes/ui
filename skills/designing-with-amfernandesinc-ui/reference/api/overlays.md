<!-- Gerado por `bun run skill:api` a partir de src/. Não edite à mão: o teste scripts/lib/skill-api.test.ts falha se este arquivo e o código divergirem. -->

# API: Overlays e feedback

## `overlays/alert` — `@amfernandesinc/ui/alert`

### Alert

`import { Alert } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/alert"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `title` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `icon` | `React.ReactNode` | — | — |
| `action` | `React.ReactNode` | — | — |
| `ref` | `React.Ref<HTMLDivElement>` | — | — |
| `variant` | `"default" \| "info" \| "success" \| "warning" \| "destructive"` | `"default"` | — |

Repassa também: atributos HTML do React (`HTMLAttributes`).

### alertVariants

`import { alertVariants } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/alert"`

Gera as classes do componente (class-variance-authority).

Variantes:

- `variant`: `default`, `info`, `success`, `warning`, `destructive` (padrão `"default"`)

### AlertProps

`import type { AlertProps } from "@amfernandesinc/ui"`

```ts
export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}
```

## `overlays/alert-dialog` — `@amfernandesinc/ui/alert-dialog`

### AlertDialog

`import { AlertDialog } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/alert-dialog"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `trigger` | `React.ReactNode` | — | — |
| `title` | `React.ReactNode` | **obrigatória** | — |
| `description` | `React.ReactNode` | — | What happens if the user confirms ("Esta ação não pode ser desfeita."). Optional, but an alert dialog should have one: it is what a screen reader reads after the title, and Radix warns in development without it. |
| `open` | `boolean` | — | — |
| `defaultOpen` | `boolean` | — | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `onConfirm` | `() => void \| Promise<unknown>` | **obrigatória** | Called on the confirm button. Return a Promise (the request behind "Aprovar") and the dialog waits for it: the button shows a spinner, both buttons and Escape are ignored, the dialog closes when it resolves and stays open when it rejects, so the consumer can show the error inside it (in `children`) or in a toast and the user can try again. |
| `onCancel` | `() => void` | — | Called on "Cancelar" and on Escape. |
| `confirmLabel` | `string` | `"Confirmar"` | — |
| `cancelLabel` | `string` | `"Cancelar"` | — |
| `confirmVariant` | `ButtonProps["variant"]` | `"default"` | — |
| `children` | `React.ReactNode` | — | — |
| `onCloseAutoFocus` | `(event: Event) => void` | — | Handler do foco ao fechar. Por padrão o foco volta para o `trigger`; sem `trigger` (aberto por `open`, a partir de um botão da página ou de um item de menu), volta para o elemento que tinha o foco quando o diálogo abriu. Chame `event.preventDefault()` para mandar o foco para outro lugar. |
| `className` | `string` | — | — |
| `ref` | `React.Ref<HTMLDivElement>` | — | The content panel (`[data-slot="alert-dialog-content"]`). |
| `contentProps` | `OverlayContentProps` | — | Attributes for the content panel: `id`, `data-*`, `aria-*`, handlers. The overlay's own props win over these. |

### AlertDialogProps

`import type { AlertDialogProps } from "@amfernandesinc/ui"`

```ts
export interface AlertDialogProps {
  trigger?: React.ReactNode
  title: React.ReactNode
  /**
   * What happens if the user confirms ("Esta ação não pode ser desfeita.").
   * Optional, but an alert dialog should have one: it is what a screen
   * reader reads after the title, and Radix warns in development without it.
   */
  description?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * Called on the confirm button. Return a Promise (the request behind
   * "Aprovar") and the dialog waits for it: the button shows a spinner, both
   * buttons and Escape are ignored, the dialog closes when it resolves and
   * stays open when it rejects, so the consumer can show the error inside it
   * (in `children`) or in a toast and the user can try again.
   */
  // biome-ignore lint/suspicious/noConfusingVoidType: a handler that returns nothing (any function the consumer already has), or a Promise to wait for
  onConfirm: () => void | Promise<unknown>
  /** Called on "Cancelar" and on Escape. */
  onCancel?: () => void
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: ButtonProps["variant"]
  children?: React.ReactNode
  /**
   * Handler do foco ao fechar. Por padrão o foco volta para o `trigger`; sem
   * `trigger` (aberto por `open`, a partir de um botão da página ou de um item
   * de menu), volta para o elemento que tinha o foco quando o diálogo abriu.
   * Chame `event.preventDefault()` para mandar o foco para outro lugar.
   */
  onCloseAutoFocus?: (event: Event) => void
  className?: string
  /** The content panel (`[data-slot="alert-dialog-content"]`). */
  ref?: React.Ref<HTMLDivElement>
  /**
   * Attributes for the content panel: `id`, `data-*`, `aria-*`, handlers.
   * The overlay's own props win over these.
   */
  contentProps?: OverlayContentProps
}
```

## `overlays/collapsible` — `@amfernandesinc/ui/collapsible`

### Collapsible

`import { Collapsible } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/collapsible"`

As props são uma união: cada forma abaixo é um jeito de usar o componente.

#### `CollapsibleBaseProps & CollapsibleTitleProps`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `triggerSide` | `"left" \| "right"` | `"right"` | — |
| `triggerLabel` | `string` | `"Alternar seção"` | — |
| `defaultOpen` | `boolean` | — | — |
| `open` | `boolean` | — | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `disabled` | `boolean` | — | The section cannot be opened or closed: the trigger is disabled (and the default one looks it). An open section stays readable. |
| `keepMounted` | `boolean` | `false` | Keep the content in the DOM while closed (hidden, out of the tab order), so the uncontrolled fields of a collapsed section keep what was typed. Closing then happens at once, without the collapse animation. |
| `className` | `string` | — | — |
| `children` | `React.ReactNode` | **obrigatória** | — |
| `title` | `React.ReactNode` | — | Text of the default trigger. |
| `trigger` | `never` | — | — |

#### `CollapsibleBaseProps & CollapsibleTriggerProps`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `triggerSide` | `"left" \| "right"` | `"right"` | — |
| `triggerLabel` | `string` | `"Alternar seção"` | — |
| `defaultOpen` | `boolean` | — | — |
| `open` | `boolean` | — | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `disabled` | `boolean` | — | The section cannot be opened or closed: the trigger is disabled (and the default one looks it). An open section stays readable. |
| `keepMounted` | `boolean` | `false` | Keep the content in the DOM while closed (hidden, out of the tab order), so the uncontrolled fields of a collapsed section keep what was typed. Closing then happens at once, without the collapse animation. |
| `className` | `string` | — | — |
| `children` | `React.ReactNode` | **obrigatória** | — |
| `trigger` | `React.ReactNode` | **obrigatória** | Replaces the default chevron button: one element that takes a ref and spreads props (a `Button`). It gets `aria-expanded` and `disabled`. |
| `title` | `never` | — | — |


### CollapsibleProps

`import type { CollapsibleProps } from "@amfernandesinc/ui"`

```ts
export type CollapsibleProps = CollapsibleBaseProps &
  (CollapsibleTitleProps | CollapsibleTriggerProps)
```

## `overlays/dialog` — `@amfernandesinc/ui/dialog`

### Dialog

`import { Dialog } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/dialog"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `trigger` | `React.ReactNode` | — | Element that opens the dialog. Omit for fully controlled use. |
| `title` | `React.ReactNode` | **obrigatória** | Required for a11y (Radix logs a warning otherwise). |
| `description` | `React.ReactNode` | — | — |
| `children` | `React.ReactNode` | — | Body content, between the header and the footer. The dialog never grows past the screen: when the body is taller than the room left, it scrolls and title, description and footer stay in place. |
| `footer` | `ModalFooter` | — | Footer slot (renders flex-end justify with gap-2). Stays at the bottom. Also takes a function, which receives `close`: the way an uncontrolled modal closes from "Cancelar". ```tsx footer={({ close }) => ( <> <Button variant="outline" onClick={close}>Cancelar</Button> <Button type="submit" form="proposta">Salvar</Button> </> )} ``` |
| `open` | `boolean` | — | — |
| `defaultOpen` | `boolean` | — | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `dismissible` | `boolean` | `true` | When `false`, prevents Escape key and overlay click from closing the dialog, and hides the X close button. Useful for required confirmations or step flows. Default `true`. |
| `hideCloseButton` | `boolean` | `false` | — |
| `closeLabel` | `string` | `DEFAULT_CLOSE_LABEL` | Name of the X. |
| `onOpenAutoFocus` | `(event: Event) => void` | — | Handler do auto-focus do Radix ao abrir (ex.: direcionar o foco inicial). |
| `onCloseAutoFocus` | `(event: Event) => void` | — | Handler do foco ao fechar. Por padrão o foco volta para o `trigger`; sem `trigger` (aberto por `open`, a partir de um botão da página ou de um item de menu), volta para o elemento que tinha o foco quando o diálogo abriu. Chame `event.preventDefault()` para mandar o foco para outro lugar. |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Visual size of the modal. |
| `className` | `string` | — | Extra class on the content element. |
| `ref` | `React.Ref<HTMLDivElement>` | — | The content panel (`[data-slot="dialog-content"]`). |
| `contentProps` | `OverlayContentProps` | — | Attributes for the content panel: `id`, `data-*`, `aria-*`, handlers. The overlay's own props win over these. |

### DialogProps

`import type { DialogProps } from "@amfernandesinc/ui"`

```ts
export interface DialogProps {
  /** Element that opens the dialog. Omit for fully controlled use. */
  trigger?: React.ReactNode
  /** Required for a11y (Radix logs a warning otherwise). */
  title: React.ReactNode
  description?: React.ReactNode
  /**
   * Body content, between the header and the footer. The dialog never grows
   * past the screen: when the body is taller than the room left, it scrolls
   * and title, description and footer stay in place.
   */
  children?: React.ReactNode
  /**
   * Footer slot (renders flex-end justify with gap-2). Stays at the bottom.
   *
   * Also takes a function, which receives `close`: the way an uncontrolled
   * modal closes from "Cancelar".
   *
   * ```tsx
   * footer={({ close }) => (
   *   <>
   *     <Button variant="outline" onClick={close}>Cancelar</Button>
   *     <Button type="submit" form="proposta">Salvar</Button>
   *   </>
   * )}
   * ```
   */
  footer?: ModalFooter
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * When `false`, prevents Escape key and overlay click from closing the dialog,
   * and hides the X close button. Useful for required confirmations or step flows.
   * Default `true`.
   */
  dismissible?: boolean
  hideCloseButton?: boolean
  /** Name of the X. @default "Fechar" */
  closeLabel?: string
  /** Handler do auto-focus do Radix ao abrir (ex.: direcionar o foco inicial). */
  onOpenAutoFocus?: (event: Event) => void
  /**
   * Handler do foco ao fechar. Por padrão o foco volta para o `trigger`; sem
   * `trigger` (aberto por `open`, a partir de um botão da página ou de um item
   * de menu), volta para o elemento que tinha o foco quando o diálogo abriu.
   * Chame `event.preventDefault()` para mandar o foco para outro lugar.
   */
  onCloseAutoFocus?: (event: Event) => void
  /** Visual size of the modal. */
  size?: "sm" | "md" | "lg" | "xl"
  /** Extra class on the content element. */
  className?: string
  /** The content panel (`[data-slot="dialog-content"]`). */
  ref?: React.Ref<HTMLDivElement>
  /**
   * Attributes for the content panel: `id`, `data-*`, `aria-*`, handlers.
   * The overlay's own props win over these.
   */
  contentProps?: OverlayContentProps
}
```

## `overlays/dropdown-menu` — `@amfernandesinc/ui/dropdown-menu`

### DropdownMenu

`import { DropdownMenu } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/dropdown-menu"`

Menu of actions anchored to a trigger. Data-driven: describe the rows in `items` (actions, links, checkboxes, radio groups, labelled groups, separators and submenus) and the component renders them with full keyboard support (arrows, Home/End, typeahead, Escape returns focus). For page navigation use `AppShell`/`Tabs`; for picking a form value use `Combobox`.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `trigger` | `React.ReactNode` | **obrigatória** | Element that opens the menu — usually a `Button` or an `IconButton`. It receives the trigger props and ref, so it must be a single element that spreads props onto a focusable node. |
| `items` | `DropdownMenuEntry[]` | **obrigatória** | — |
| `open` | `boolean` | — | — |
| `defaultOpen` | `boolean` | — | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | — |
| `align` | `"start" \| "center" \| "end"` | `"start"` | — |
| `sideOffset` | `number` | `4` | — |
| `modal` | `boolean` | `true` | When `true` (default) the rest of the page is inert while the menu is open: a click outside only closes it. Set `false` for the "…" menu of a table row: with one row's menu open, a click on another row's "…" closes it and opens that one at once (with `modal`, it takes two clicks). Also for a menu inside a toolbar that must keep scrolling. |
| `className` | `string` | — | Classes for the menu panel (e.g. a fixed width). |
| `ref` | `React.Ref<HTMLDivElement>` | — | The menu panel (`[data-slot="dropdown-menu-content"]`). |
| `contentProps` | `OverlayContentProps` | — | Attributes for the menu panel: `id`, `data-*`, `aria-*`, handlers. The menu's own props win over these (its key and pointer handlers among them). |

### DropdownMenuActionItem

`import type { DropdownMenuActionItem } from "@amfernandesinc/ui"`

Action row. The default entry type — `type` can be omitted.

```ts
export interface DropdownMenuActionItem {
  type?: "item"
  /** Stable React key. Needed only when the list reorders or filters. */
  id?: string
  label: React.ReactNode
  icon?: MenuIcon
  /** Hint on the right, e.g. "⌘D". Display only — wire the shortcut yourself. */
  shortcut?: string
  onSelect?: () => void
  /**
   * Turns the row into a real link (middle-click / ⌘-click keep working).
   * Unsafe protocols (`javascript:`, `vbscript:`, `file:`…) are dropped and
   * the row falls back to a plain action.
   */
  href?: string
  /** Link target. `"_blank"` also sets `rel="noopener noreferrer"`. */
  target?: React.HTMLAttributeAnchorTarget
  /** `"destructive"` paints the row in the error colour (delete, archive). */
  variant?: "default" | "destructive"
  disabled?: boolean
  /** Keep the menu open after selecting (e.g. a counter you click repeatedly). */
  keepOpen?: boolean
}
```

### DropdownMenuCheckboxItem

`import type { DropdownMenuCheckboxItem } from "@amfernandesinc/ui"`

Row with a check mark, for independent on/off options.

```ts
export interface DropdownMenuCheckboxItem {
  type: "checkbox"
  id?: string
  label: React.ReactNode
  icon?: MenuIcon
  shortcut?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  /** Keep the menu open after toggling (e.g. show/hide several columns). */
  keepOpen?: boolean
}
```

### DropdownMenuEntry

`import type { DropdownMenuEntry } from "@amfernandesinc/ui"`

```ts
export type DropdownMenuEntry =
  | DropdownMenuActionItem
  | DropdownMenuCheckboxItem
  | DropdownMenuRadioGroup
  | DropdownMenuGroup
  | DropdownMenuSubmenu
  | DropdownMenuSeparator
```

### DropdownMenuGroup

`import type { DropdownMenuGroup } from "@amfernandesinc/ui"`

Labelled section of rows.

```ts
export interface DropdownMenuGroup {
  type: "group"
  id?: string
  label?: React.ReactNode
  items: DropdownMenuEntry[]
}
```

### DropdownMenuProps

`import type { DropdownMenuProps } from "@amfernandesinc/ui"`

```ts
export interface DropdownMenuProps {
  /**
   * Element that opens the menu — usually a `Button` or an `IconButton`. It
   * receives the trigger props and ref, so it must be a single element that
   * spreads props onto a focusable node.
   */
  trigger: React.ReactNode
  items: DropdownMenuEntry[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** @default "bottom" */
  side?: "top" | "right" | "bottom" | "left"
  /** @default "start" */
  align?: "start" | "center" | "end"
  /** @default 4 */
  sideOffset?: number
  /**
   * When `true` (default) the rest of the page is inert while the menu is
   * open: a click outside only closes it.
   *
   * Set `false` for the "…" menu of a table row: with one row's menu open, a
   * click on another row's "…" closes it and opens that one at once (with
   * `modal`, it takes two clicks). Also for a menu inside a toolbar that must
   * keep scrolling.
   * @default true
   */
  modal?: boolean
  /** Classes for the menu panel (e.g. a fixed width). */
  className?: string
  /** The menu panel (`[data-slot="dropdown-menu-content"]`). */
  ref?: React.Ref<HTMLDivElement>
  /**
   * Attributes for the menu panel: `id`, `data-*`, `aria-*`, handlers. The
   * menu's own props win over these (its key and pointer handlers among them).
   */
  contentProps?: OverlayContentProps
}
```

### DropdownMenuRadioGroup

`import type { DropdownMenuRadioGroup } from "@amfernandesinc/ui"`

Mutually exclusive options (sort order, density…).

```ts
export interface DropdownMenuRadioGroup {
  type: "radio"
  id?: string
  /** Optional heading above the options. */
  label?: React.ReactNode
  value: string
  onValueChange: (value: string) => void
  options: DropdownMenuRadioOption[]
  keepOpen?: boolean
}
```

### DropdownMenuRadioOption

`import type { DropdownMenuRadioOption } from "@amfernandesinc/ui"`

```ts
export interface DropdownMenuRadioOption {
  value: string
  label: React.ReactNode
  icon?: MenuIcon
  disabled?: boolean
}
```

### DropdownMenuSeparator

`import type { DropdownMenuSeparator } from "@amfernandesinc/ui"`

```ts
export interface DropdownMenuSeparator {
  type: "separator"
  id?: string
}
```

### DropdownMenuSubmenu

`import type { DropdownMenuSubmenu } from "@amfernandesinc/ui"`

Row that opens a nested menu to the side.

```ts
export interface DropdownMenuSubmenu {
  type: "submenu"
  id?: string
  label: React.ReactNode
  icon?: MenuIcon
  disabled?: boolean
  items: DropdownMenuEntry[]
}
```

## `overlays/popover` — `@amfernandesinc/ui/popover`

### Popover

`import { Popover } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/popover"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `trigger` | `React.ReactNode` | — | Element that opens and closes the popover, and that it points at. |
| `anchor` | `React.ReactNode` | — | Element the popover points at without opening it: a table cell, a field, a line of text. Open it with `open`. Use it instead of `trigger` when something else opens the popover; without either one the popover has nowhere to go. |
| `children` | `React.ReactNode` | — | — |
| `open` | `boolean` | — | — |
| `defaultOpen` | `boolean` | — | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `align` | `"start" \| "center" \| "end"` | `"center"` | — |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | — | — |
| `sideOffset` | `number` | `4` | — |
| `collisionPadding` | `PopoverContentProps["collisionPadding"]` | — | Minimum distance in px kept between the content and the viewport edges when it flips or shifts on collision. Uses the Radix default (`0`) when omitted. |
| `modal` | `boolean` | — | — |
| `className` | `string` | — | — |
| `aria-label` | `string` | — | Name of the popover, which is a `role="dialog"`: "Filtros", "Cidades". Without this or `aria-labelledby` it is named by its trigger; with neither a name nor a trigger, a warning in development. |
| `aria-labelledby` | `string` | — | Id of the element that names the popover (its title). |
| `onInteractOutside` | `PopoverContentProps["onInteractOutside"]` | — | — |
| `onPointerDownOutside` | `PopoverContentProps["onPointerDownOutside"]` | — | — |
| `onFocusOutside` | `PopoverContentProps["onFocusOutside"]` | — | — |
| `onEscapeKeyDown` | `PopoverContentProps["onEscapeKeyDown"]` | — | — |
| `ref` | `React.Ref<HTMLDivElement>` | — | The content panel (`[data-slot="popover-content"]`). |
| `contentProps` | `OverlayContentProps` | — | Attributes for the content panel: `id`, `data-*`, `aria-*`, handlers. The overlay's own props win over these. |

### PopoverProps

`import type { PopoverProps } from "@amfernandesinc/ui"`

```ts
export interface PopoverProps {
  /** Element that opens and closes the popover, and that it points at. */
  trigger?: React.ReactNode
  /**
   * Element the popover points at without opening it: a table cell, a field,
   * a line of text. Open it with `open`. Use it instead of `trigger` when
   * something else opens the popover; without either one the popover has
   * nowhere to go.
   */
  anchor?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  /** Minimum distance in px kept between the content and the viewport edges when it flips or shifts on collision. Uses the Radix default (`0`) when omitted. */
  collisionPadding?: PopoverContentProps["collisionPadding"]
  modal?: boolean
  className?: string
  /**
   * Name of the popover, which is a `role="dialog"`: "Filtros", "Cidades".
   * Without this or `aria-labelledby` it is named by its trigger; with
   * neither a name nor a trigger, a warning in development.
   */
  "aria-label"?: string
  /** Id of the element that names the popover (its title). */
  "aria-labelledby"?: string
  onInteractOutside?: PopoverContentProps["onInteractOutside"]
  onPointerDownOutside?: PopoverContentProps["onPointerDownOutside"]
  onFocusOutside?: PopoverContentProps["onFocusOutside"]
  onEscapeKeyDown?: PopoverContentProps["onEscapeKeyDown"]
  /** The content panel (`[data-slot="popover-content"]`). */
  ref?: React.Ref<HTMLDivElement>
  /**
   * Attributes for the content panel: `id`, `data-*`, `aria-*`, handlers.
   * The overlay's own props win over these.
   */
  contentProps?: OverlayContentProps
}
```

## `overlays/progress` — `@amfernandesinc/ui/progress`

### Progress

`import { Progress } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/progress"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `value` | `number \| null` | — | How far it got, from 0 to `max`. `null` or `undefined`: indeterminate (it is running, nobody knows how long it takes), drawn as a moving segment. |
| `max` | `number` | `100` | The value of "done": 7 for step 3 of 7. |
| `ref` | `React.Ref<React.ComponentRef<typeof ProgressPrimitive.Root>>` | — | — |

Repassa também: props de `@radix-ui/react-primitive`; props de `@radix-ui/react-progress` (`ProgressProps`); atributos HTML do React (`Attributes`, `HTMLAttributes`).

### ProgressProps

`import type { ProgressProps } from "@amfernandesinc/ui"`

```ts
export interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, "value" | "max"> {
  /**
   * How far it got, from 0 to `max`. `null` or `undefined`: indeterminate (it
   * is running, nobody knows how long it takes), drawn as a moving segment.
   */
  value?: number | null
  /** The value of "done": 7 for step 3 of 7. @default 100 */
  max?: number
  ref?: React.Ref<React.ComponentRef<typeof ProgressPrimitive.Root>>
}
```

## `overlays/sheet` — `@amfernandesinc/ui/sheet`

### Sheet

`import { Sheet } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/sheet"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Width of a side panel (`left`, `right`) from the `sm` breakpoint up: `sm` 320px, `md` 384px, `lg` 672px. Below it, 3/4 of the screen. Top and bottom panels take the whole width. |
| `trigger` | `React.ReactNode` | — | — |
| `title` | `React.ReactNode` | **obrigatória** | — |
| `description` | `React.ReactNode` | — | — |
| `children` | `React.ReactNode` | — | Body of the panel. It takes the room between the header and the footer and scrolls when its content is taller than that. |
| `footer` | `ModalFooter` | — | Footer slot, at the bottom of the panel (flex-end, gap-2). Also takes a function, which receives `close`: the way an uncontrolled modal closes from "Cancelar". ```tsx footer={({ close }) => ( <> <Button variant="outline" onClick={close}>Cancelar</Button> <Button type="submit" form="proposta">Salvar</Button> </> )} ``` |
| `open` | `boolean` | — | — |
| `defaultOpen` | `boolean` | — | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `dismissible` | `boolean` | `true` | When `false`, Escape and a press outside do not close the panel, and the X is hidden: for a step that has to end on one of the footer's buttons. |
| `closeLabel` | `string` | `DEFAULT_CLOSE_LABEL` | Name of the X. |
| `hideCloseButton` | `boolean` | `false` | — |
| `onOpenAutoFocus` | `(event: Event) => void` | — | Radix's auto-focus on open (e.g. to choose the first focused field). |
| `onCloseAutoFocus` | `(event: Event) => void` | — | Handler do foco ao fechar. Por padrão o foco volta para o `trigger`; sem `trigger` (aberto por `open`, a partir de um botão da página ou de um item de menu), volta para o elemento que tinha o foco quando o painel abriu. Chame `event.preventDefault()` para mandar o foco para outro lugar. |
| `className` | `string` | — | — |
| `ref` | `React.Ref<HTMLDivElement>` | — | The content panel (`[data-slot="sheet-content"]`). |
| `contentProps` | `OverlayContentProps` | — | Attributes for the content panel: `id`, `data-*`, `aria-*`, handlers. The overlay's own props win over these. |
| `side` | `"bottom" \| "left" \| "right" \| "top"` | `"right"` | — |

### SheetProps

`import type { SheetProps } from "@amfernandesinc/ui"`

```ts
export interface SheetProps extends Omit<VariantProps<typeof sheetVariants>, "size"> {
  /**
   * Width of a side panel (`left`, `right`) from the `sm` breakpoint up:
   * `sm` 320px, `md` 384px, `lg` 672px. Below it, 3/4 of the screen. Top and
   * bottom panels take the whole width.
   * @default "md"
   */
  size?: "sm" | "md" | "lg"
  trigger?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /**
   * Body of the panel. It takes the room between the header and the footer
   * and scrolls when its content is taller than that.
   */
  children?: React.ReactNode
  /**
   * Footer slot, at the bottom of the panel (flex-end, gap-2).
   *
   * Also takes a function, which receives `close`: the way an uncontrolled
   * modal closes from "Cancelar".
   *
   * ```tsx
   * footer={({ close }) => (
   *   <>
   *     <Button variant="outline" onClick={close}>Cancelar</Button>
   *     <Button type="submit" form="proposta">Salvar</Button>
   *   </>
   * )}
   * ```
   */
  footer?: ModalFooter
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * When `false`, Escape and a press outside do not close the panel, and the
   * X is hidden: for a step that has to end on one of the footer's buttons.
   * @default true
   */
  dismissible?: boolean
  /** Name of the X. @default "Fechar" */
  closeLabel?: string
  hideCloseButton?: boolean
  /** Radix's auto-focus on open (e.g. to choose the first focused field). */
  onOpenAutoFocus?: (event: Event) => void
  /**
   * Handler do foco ao fechar. Por padrão o foco volta para o `trigger`; sem
   * `trigger` (aberto por `open`, a partir de um botão da página ou de um item
   * de menu), volta para o elemento que tinha o foco quando o painel abriu.
   * Chame `event.preventDefault()` para mandar o foco para outro lugar.
   */
  onCloseAutoFocus?: (event: Event) => void
  className?: string
  /** The content panel (`[data-slot="sheet-content"]`). */
  ref?: React.Ref<HTMLDivElement>
  /**
   * Attributes for the content panel: `id`, `data-*`, `aria-*`, handlers.
   * The overlay's own props win over these.
   */
  contentProps?: OverlayContentProps
}
```

## `overlays/sonner` — `@amfernandesinc/ui/sonner`

### Toaster

`import { Toaster } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/sonner"`

Container of the toasts. Mount one at the root of the app and fire them with `toast()` from anywhere. It takes every prop of Sonner's `Toaster`. `className`, `style`, `icons` and `toastOptions` (with its `classNames`) are merged with the library's own, key by key: a prop given here adds to or replaces that one key, it does not throw the rest away.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `closeButton` | `boolean` | `true` | Shows an X on every toast. On by default: an error stays until it is closed, and nobody should have to wait for a toast to leave. |
| `labels` | `Partial<ToasterLabels>` | — | Texts read by screen readers. Sonner's own `containerAriaLabel` and `toastOptions.closeButtonAriaLabel` still work, and win when given. |

Repassa também: props de `sonner` (`ToasterProps`).

### defaultToasterLabels

`import { defaultToasterLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/sonner"`

```ts
const defaultToasterLabels: ToasterLabels = {
  region: "Notificações",
  close: "Fechar notificação",
}
```

### toast

`import { toast } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/sonner"`

Sonner's `toast`, with one difference: errors (`toast.error` and the error of `toast.promise`) stay until they are closed. Everything else is Sonner's.

```ts
const toast: typeof sonnerToast
```

### ToasterLabels

`import type { ToasterLabels } from "@amfernandesinc/ui"`

```ts
export interface ToasterLabels {
  /** Name of the notification region. Sonner appends the shortcut ("alt+T"). */
  region: string
  /** Name of the X of each toast. */
  close: string
}
```

### ToasterProps

`import type { ToasterProps } from "@amfernandesinc/ui"`

```ts
export interface ToasterProps extends SonnerToasterProps {
  /**
   * Shows an X on every toast. On by default: an error stays until it is
   * closed, and nobody should have to wait for a toast to leave.
   * @default true
   */
  closeButton?: boolean
  /**
   * Texts read by screen readers. Sonner's own `containerAriaLabel` and
   * `toastOptions.closeButtonAriaLabel` still work, and win when given.
   */
  labels?: Partial<ToasterLabels>
}
```

## `overlays/tooltip` — `@amfernandesinc/ui/tooltip`

### Tooltip

`import { Tooltip } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/tooltip"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `content` | `React.ReactNode` | **obrigatória** | — |
| `children` | `React.ReactNode` | **obrigatória** | The element the tooltip describes: one element that takes a ref and spreads props (a `Button`, an `IconButton`, a link). A disabled control (`disabled`) gets no pointer or focus events, so it cannot open a tooltip by itself. It is wrapped in a focusable `<span>` that does: the tooltip opens on hover and on keyboard focus, which is the place to say why the action is unavailable ("Só o gestor pode excluir"). Tooltips do not open on touch (a press activates the control): on a phone, say it in the page too. |
| `open` | `boolean` | — | — |
| `defaultOpen` | `boolean` | — | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `delayDuration` | `number` | `200` | — |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | — | — |
| `align` | `"start" \| "center" \| "end"` | — | — |
| `sideOffset` | `number` | `4` | — |
| `className` | `string` | — | — |
| `ref` | `React.Ref<HTMLDivElement>` | — | The content panel (`[data-slot="tooltip-content"]`). |
| `contentProps` | `OverlayContentProps` | — | Attributes for the content panel: `id`, `data-*`, `aria-*`, handlers. The overlay's own props win over these. |

### TooltipProps

`import type { TooltipProps } from "@amfernandesinc/ui"`

```ts
export interface TooltipProps {
  content: React.ReactNode
  /**
   * The element the tooltip describes: one element that takes a ref and
   * spreads props (a `Button`, an `IconButton`, a link).
   *
   * A disabled control (`disabled`) gets no pointer or focus events, so it
   * cannot open a tooltip by itself. It is wrapped in a focusable `<span>`
   * that does: the tooltip opens on hover and on keyboard focus, which is the
   * place to say why the action is unavailable ("Só o gestor pode excluir").
   * Tooltips do not open on touch (a press activates the control): on a
   * phone, say it in the page too.
   */
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
  className?: string
  /** The content panel (`[data-slot="tooltip-content"]`). */
  ref?: React.Ref<HTMLDivElement>
  /**
   * Attributes for the content panel: `id`, `data-*`, `aria-*`, handlers.
   * The overlay's own props win over these.
   */
  contentProps?: OverlayContentProps
}
```

## `overlays/tour` — `@amfernandesinc/ui/tour`

### Tour

`import { Tour } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/tour"`

Guided product tour (onboarding). Points a callout at one element of the page per step, with "Voltar" / "Próximo" / "Concluir", an optional spotlight around the target and "2 de 5" progress. Non-modal: the page stays usable, clicks outside don't end the tour, Escape and the X dismiss it. Focus moves into the callout on each step and goes back to where it was when the tour ends; Tab past the callout's controls goes to the target and on through the page. Keep tours short and never put must-know information only in a tour.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `steps` | `TourStep[]` | **obrigatória** | — |
| `open` | `boolean` | **obrigatória** | Whether the tour is running. Start it when it makes sense for the user. |
| `onClose` | `(reason: TourCloseReason) => void` | — | Called when the tour ends. Persist completion here (e.g. localStorage) so the user doesn't see the same tour on every visit. |
| `step` | `number` | — | Controlled step index (0-based). |
| `defaultStep` | `number` | `0` | Step shown when the tour opens, uncontrolled. |
| `onStepChange` | `(index: number) => void` | — | — |
| `spotlight` | `boolean` | `true` | Dim the page around the target. |
| `showProgress` | `boolean` | `true` | Show "2 de 5" in each step. |
| `labels` | `Partial<TourLabels>` | — | — |
| `ref` | `React.Ref<HTMLDivElement>` | — | The content panel (`[data-slot="tour-step"]`). |
| `contentProps` | `OverlayContentProps` | — | Attributes for the content panel: `id`, `data-*`, `aria-*`, handlers. The overlay's own props win over these. |

### defaultTourLabels

`import { defaultTourLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/tour"`

```ts
const defaultTourLabels: TourLabels = {
  previous: "Voltar",
  next: "Próximo",
  finish: "Concluir",
  close: "Fechar tour",
  progress: (current, total) => `${current} de ${total}`,
}
```

### TourCloseReason

`import type { TourCloseReason } from "@amfernandesinc/ui"`

`"completed"`: "Concluir" on the last step. `"dismissed"`: the X button or Escape.

```ts
export type TourCloseReason = "completed" | "dismissed"
```

### TourLabels

`import type { TourLabels } from "@amfernandesinc/ui"`

```ts
export interface TourLabels {
  previous: string
  next: string
  finish: string
  close: string
  progress: (current: number, total: number) => string
}
```

### TourProps

`import type { TourProps } from "@amfernandesinc/ui"`

```ts
export interface TourProps {
  steps: TourStep[]
  /** Whether the tour is running. Start it when it makes sense for the user. */
  open: boolean
  /**
   * Called when the tour ends. Persist completion here (e.g. localStorage) so
   * the user doesn't see the same tour on every visit.
   */
  onClose?: (reason: TourCloseReason) => void
  /** Controlled step index (0-based). */
  step?: number
  /** Step shown when the tour opens, uncontrolled. @default 0 */
  defaultStep?: number
  onStepChange?: (index: number) => void
  /** Dim the page around the target. @default true */
  spotlight?: boolean
  /** Show "2 de 5" in each step. @default true */
  showProgress?: boolean
  labels?: Partial<TourLabels>
  /** The content panel (`[data-slot="tour-step"]`). */
  ref?: React.Ref<HTMLDivElement>
  /**
   * Attributes for the content panel: `id`, `data-*`, `aria-*`, handlers.
   * The overlay's own props win over these.
   */
  contentProps?: OverlayContentProps
}
```

### TourStep

`import type { TourStep } from "@amfernandesinc/ui"`

```ts
export interface TourStep {
  /** Element to point at: a ref, a CSS selector, or a function returning the element. */
  target: TourTarget
  title: React.ReactNode
  content?: React.ReactNode
  /** Side of the target the callout sits on. @default "bottom" */
  side?: "top" | "right" | "bottom" | "left"
  /** Alignment of the callout along that side. @default "start" */
  align?: "start" | "center" | "end"
}
```

### TourTarget

`import type { TourTarget } from "@amfernandesinc/ui"`

```ts
export type TourTarget = React.RefObject<HTMLElement | null> | string | (() => HTMLElement | null)
```
