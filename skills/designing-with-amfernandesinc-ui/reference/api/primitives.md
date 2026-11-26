<!-- Gerado por `bun run skill:api` a partir de src/. Não edite à mão: o teste scripts/lib/skill-api.test.ts falha se este arquivo e o código divergirem. -->

# API: Primitivos

## `primitives/avatar` — `@amfernandesinc/ui/avatar`

### Avatar

`import { Avatar } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/avatar"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `src` | `string` | — | — |
| `alt` | `string` | **obrigatória** | Who or what the avatar is ("Ana Souza"). The accessible name of the whole avatar (`role="img"`), read the same with the photo or with the fallback. |
| `fallback` | `React.ReactNode` | **obrigatória** | Shown while the photo loads, when it fails or without `src`: initials or an icon. |
| `allowedProtocols` | `string[]` | — | Allowed URL protocols for `src`. Defaults to `["http:", "https:"]` (`DEFAULT_ALLOWED_RESOURCE_PROTOCOLS`). The list replaces the default, so to accept base64 thumbnails as well, add to it: `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "data:"]` (`["data:"]` alone would block https photos). `javascript:` is always blocked. |
| `ref` | `React.Ref<HTMLSpanElement>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |

Repassa também: props de `@radix-ui/react-primitive`; atributos HTML do React (`Attributes`, `HTMLAttributes`).

### AvatarProps

`import type { AvatarProps } from "@amfernandesinc/ui"`

```ts
export interface AvatarProps
  extends Omit<React.ComponentProps<typeof AvatarPrimitive.Root>, "children"> {
  src?: string
  /**
   * Who or what the avatar is ("Ana Souza"). The accessible name of the whole
   * avatar (`role="img"`), read the same with the photo or with the fallback.
   */
  alt: string
  /** Shown while the photo loads, when it fails or without `src`: initials or an icon. */
  fallback: React.ReactNode
  /**
   * Allowed URL protocols for `src`. Defaults to `["http:", "https:"]`
   * (`DEFAULT_ALLOWED_RESOURCE_PROTOCOLS`). The list replaces the default, so
   * to accept base64 thumbnails as well, add to it:
   * `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "data:"]` (`["data:"]` alone
   * would block https photos). `javascript:` is always blocked.
   */
  allowedProtocols?: string[]
  ref?: React.Ref<HTMLSpanElement>
}
```

## `primitives/badge` — `@amfernandesinc/ui/badge`

### Badge

`import { Badge } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/badge"`

A short status label ("Aprovado", "Pendente", a count). It is a `<span>`, so it can sit in a sentence or a table cell; with `asChild` it takes the element of its child.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `asChild` | `boolean` | `false` | — |
| `dot` | `boolean` | `false` | Dot + label instead of a filled chip. Use it in dense tables, where a column of filled badges would outweigh the content. |
| `ref` | `React.Ref<HTMLSpanElement>` | — | — |
| `variant` | `"default" \| "info" \| "success" \| "warning" \| "destructive" \| "secondary" \| "outline"` | `"default"` | — |

Repassa também: atributos HTML do React (`HTMLAttributes`).

### badgeVariants

`import { badgeVariants } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/badge"`

Gera as classes do componente (class-variance-authority).

Variantes:

- `variant`: `default`, `secondary`, `destructive`, `info`, `success`, `warning`, `outline` (padrão `"default"`)

### BadgeProps

`import type { BadgeProps } from "@amfernandesinc/ui"`

```ts
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
  /**
   * Dot + label instead of a filled chip. Use it in dense tables, where a
   * column of filled badges would outweigh the content.
   */
  dot?: boolean
  ref?: React.Ref<HTMLSpanElement>
}
```

## `primitives/button` — `@amfernandesinc/ui/button`

### Button

`import { Button } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/button"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | `sm` 32px, `md` 40px, `lg` 44px: the height of the whole box, the same as an `Input`, an `IconButton` or a `Toggle` of that size. |
| `asChild` | `boolean` | `false` | — |
| `loading` | `boolean` | `false` | The action is running. A spinner takes the place of the label, which keeps its space (the width does not change), and the button ignores clicks and the keyboard. It is not natively disabled: it stays focused and is announced as busy and unavailable (`aria-busy`, `aria-disabled`). |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | `"button"` by default, so a button inside a `<form>` (Cancelar, Voltar, Adicionar item) never submits it by accident. Pass `"submit"` on the button that sends the form. Not applied with `asChild`. |
| `labels` | `Partial<ButtonLabels>` | — | Text for screen readers. Defaults in `defaultButtonLabels`. |
| `ref` | `React.Ref<HTMLButtonElement>` | — | — |
| `variant` | `"default" \| "destructive" \| "secondary" \| "outline" \| "ghost" \| "link"` | `"default"` | — |

Repassa também: atributos HTML do React (`ButtonHTMLAttributes`, `HTMLAttributes`).

### buttonVariants

`import { buttonVariants } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/button"`

Gera as classes do componente (class-variance-authority).

Variantes:

- `variant`: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` (padrão `"default"`)
- `size`: `sm`, `md`, `lg` (padrão `"md"`)

### defaultButtonLabels

`import { defaultButtonLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/button"`

```ts
const defaultButtonLabels: ButtonLabels = {
  loading: "Carregando…",
}
```

### ButtonLabels

`import type { ButtonLabels } from "@amfernandesinc/ui"`

```ts
export interface ButtonLabels {
  /** Read to screen-reader users when the button starts loading. */
  loading: string
}
```

### ButtonProps

`import type { ButtonProps } from "@amfernandesinc/ui"`

```ts
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * `sm` 32px, `md` 40px, `lg` 44px: the height of the whole box, the same as
   * an `Input`, an `IconButton` or a `Toggle` of that size. @default "md"
   */
  size?: "sm" | "md" | "lg"
  asChild?: boolean
  /**
   * The action is running. A spinner takes the place of the label, which
   * keeps its space (the width does not change), and the button ignores
   * clicks and the keyboard. It is not natively disabled: it stays focused
   * and is announced as busy and unavailable (`aria-busy`, `aria-disabled`).
   */
  loading?: boolean
  /**
   * `"button"` by default, so a button inside a `<form>` (Cancelar, Voltar,
   * Adicionar item) never submits it by accident. Pass `"submit"` on the
   * button that sends the form. Not applied with `asChild`.
   * @default "button"
   */
  type?: "button" | "submit" | "reset"
  /** Text for screen readers. Defaults in `defaultButtonLabels`. */
  labels?: Partial<ButtonLabels>
  ref?: React.Ref<HTMLButtonElement>
}
```

## `primitives/checkbox` — `@amfernandesinc/ui/checkbox`

### Checkbox

`import { Checkbox } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/checkbox"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `checked` | `boolean \| "indeterminate"` | — | `true`, `false` ou `"indeterminate"`: o estado misto de um "selecionar todos" quando só parte dos itens está marcada. Um clique no estado misto marca a caixa. |
| `defaultChecked` | `boolean \| "indeterminate"` | — | — |
| `onCheckedChange` | `(checked: boolean) => void` | — | Recebe sempre `true` ou `false`: um clique nunca produz o estado misto. |
| `id` | `string` | — | — |
| `ref` | `React.Ref<HTMLButtonElement>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |

Repassa também: props de `@radix-ui/react-checkbox` (`CheckboxProps`); props de `@radix-ui/react-primitive`; atributos HTML do React (`Attributes`, `ButtonHTMLAttributes`, `HTMLAttributes`).

### CheckboxProps

`import type { CheckboxProps } from "@amfernandesinc/ui"`

```ts
export interface CheckboxProps
  extends Omit<
    React.ComponentProps<typeof CheckboxPrimitive.Root>,
    "id" | "checked" | "defaultChecked" | "onCheckedChange"
  > {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  /**
   * `true`, `false` ou `"indeterminate"`: o estado misto de um "selecionar
   * todos" quando só parte dos itens está marcada. Um clique no estado misto
   * marca a caixa.
   */
  checked?: boolean | "indeterminate"
  defaultChecked?: boolean | "indeterminate"
  /** Recebe sempre `true` ou `false`: um clique nunca produz o estado misto. */
  onCheckedChange?: (checked: boolean) => void
  id?: string
  ref?: React.Ref<HTMLButtonElement>
}
```

## `primitives/icon-button` — `@amfernandesinc/ui/icon-button`

### IconButton

`import { IconButton } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/icon-button"`

Square button with only an icon. Unlike `Button`, the accessible name is mandatory (`label`) and shows up as a tooltip, so the action is never a mystery for mouse or screen-reader users. Defaults to `type="button"` so an icon inside a form (clear, copy, toggle visibility) never submits it by accident.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `icon` | `React.ReactNode` | **obrigatória** | The icon (e.g. a lucide-react element). Sized to 16px (20px at `lg`). |
| `label` | `string` | **obrigatória** | What the button does ("Editar", "Notificações"). Required: it is the accessible name and, by default, the tooltip text. |
| `variant` | `IconButtonVariant` | `"ghost"` | Same colours as `Button`. |
| `size` | `IconButtonSize` | `"md"` | — |
| `disabled` | `boolean` | `false` | The action is not available. The button is dimmed and ignores clicks and the keyboard, but it is never natively disabled: it is `aria-disabled`, so Tab still reaches it and its tooltip still says what it is. An icon with no tooltip and no focus would be a mystery, in a table row above all. |
| `loading` | `boolean` | `false` | The action is running: a spinner takes the place of the icon and the button ignores clicks, keeping the focus (`aria-busy`, `aria-disabled`). |
| `tooltip` | `boolean` | `true` | Show `label` as a tooltip on hover/focus. |
| `tooltipSide` | `TooltipProps["side"]` | `"top"` | Tooltip side. |
| `labels` | `Partial<ButtonLabels>` | — | Text for screen readers (`loading`). Defaults in `defaultButtonLabels`. |
| `ref` | `React.Ref<HTMLButtonElement>` | — | — |

Repassa também: atributos HTML do React (`ButtonHTMLAttributes`, `HTMLAttributes`).

### IconButtonProps

`import type { IconButtonProps } from "@amfernandesinc/ui"`

```ts
export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> {
  /** The icon (e.g. a lucide-react element). Sized to 16px (20px at `lg`). */
  icon: React.ReactNode
  /**
   * What the button does ("Editar", "Notificações"). Required: it is the
   * accessible name and, by default, the tooltip text.
   */
  label: string
  /** Same colours as `Button`. @default "ghost" */
  variant?: IconButtonVariant
  /** @default "md" */
  size?: IconButtonSize
  /**
   * The action is not available. The button is dimmed and ignores clicks and
   * the keyboard, but it is never natively disabled: it is `aria-disabled`,
   * so Tab still reaches it and its tooltip still says what it is. An icon
   * with no tooltip and no focus would be a mystery, in a table row above all.
   */
  disabled?: boolean
  /**
   * The action is running: a spinner takes the place of the icon and the
   * button ignores clicks, keeping the focus (`aria-busy`, `aria-disabled`).
   */
  loading?: boolean
  /** Show `label` as a tooltip on hover/focus. @default true */
  tooltip?: boolean
  /** Tooltip side. @default "top" */
  tooltipSide?: TooltipProps["side"]
  /** Text for screen readers (`loading`). Defaults in `defaultButtonLabels`. */
  labels?: Partial<ButtonLabels>
  ref?: React.Ref<HTMLButtonElement>
}
```

### IconButtonSize

`import type { IconButtonSize } from "@amfernandesinc/ui"`

`sm` 32px — dense rows (table actions, menu footers); `md` 40px; `lg` 44px — touch target. A square of the shared control height, so it lines up with a `Button` or an `Input` of the same size.

```ts
export type IconButtonSize = ControlSize
```

### IconButtonVariant

`import type { IconButtonVariant } from "@amfernandesinc/ui"`

```ts
export type IconButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost"
```

## `primitives/input` — `@amfernandesinc/ui/input`

### Input

`import { Input } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/input"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `label` | `React.ReactNode` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `required` | `boolean` | — | — |
| `leadingIcon` | `React.ReactNode` | — | — |
| `trailingIcon` | `React.ReactNode` | — | — |
| `size` | `ControlSize` | `"md"` | `sm` 32px, `md` 40px, `lg` 44px: the height of the bordered box, the same as a `Button` of that size. (Not the native `size` attribute.) |
| `className` | `string` | — | Classes for the `<input>` itself: text alignment, `tabular-nums`, the placeholder. The bordered box is `wrapperClassName`, and the field around label and messages (width, margins) is `fieldClassName`. |
| `wrapperClassName` | `string` | — | Classes for the box that draws the border and the fill (`data-slot="input-wrapper"`). |
| `fieldClassName` | `string` | — | Classes for the whole field: label, box and messages (`data-slot="field-shell"`). |
| `ref` | `React.Ref<HTMLInputElement>` | — | — |

Repassa também: atributos HTML do React (`HTMLAttributes`, `InputHTMLAttributes`).

### InputProps

`import type { InputProps } from "@amfernandesinc/ui"`

```ts
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode
  labelPosition?: LabelPosition
  description?: React.ReactNode
  error?: string
  required?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  /**
   * `sm` 32px, `md` 40px, `lg` 44px: the height of the bordered box, the same
   * as a `Button` of that size. (Not the native `size` attribute.)
   * @default "md"
   */
  size?: ControlSize
  /**
   * Classes for the `<input>` itself: text alignment, `tabular-nums`, the
   * placeholder. The bordered box is `wrapperClassName`, and the field
   * around label and messages (width, margins) is `fieldClassName`.
   */
  className?: string
  /** Classes for the box that draws the border and the fill (`data-slot="input-wrapper"`). */
  wrapperClassName?: string
  /** Classes for the whole field: label, box and messages (`data-slot="field-shell"`). */
  fieldClassName?: string
  ref?: React.Ref<HTMLInputElement>
}
```

## `primitives/number-input` — `@amfernandesinc/ui/number-input`

### NumberInput

`import { NumberInput } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/number-input"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `value` | `number \| null` | — | The number, or `null` for an empty field (never `0` for empty). Controlled. |
| `defaultValue` | `number \| null` | `null` | Initial value of an uncontrolled field. |
| `onValueChange` | `(value: number \| null) => void` | — | Called with the number, or `null` when the field is emptied. |
| `decimals` | `number` | `0` | Decimal places allowed and shown (up to). `0` takes whole numbers only. |
| `min` | `number` | — | Smallest value. Applied when the field loses focus and on Enter, not while typing. A negative `min` lets the minus sign be typed. |
| `max` | `number` | — | Largest value. Applied when the field loses focus and on Enter, not while typing. |
| `step` | `number` | `1` | What the arrows and the stepper buttons add or take. PageUp/PageDown move ten steps. |
| `prefix` | `React.ReactNode` | — | Fixed text before the number, inside the field. |
| `suffix` | `React.ReactNode` | — | Unit after the number, inside the field ("m²", "andares"). |
| `steppers` | `boolean` | `false` | Shows − and + buttons in the field. They do not take focus from the input. |
| `labels` | `Partial<NumberInputLabels>` | — | — |
| `required` | `boolean` | — | — |
| `className` | `string` | — | Classes for the `<input>` itself: text alignment, `tabular-nums`, the placeholder. The bordered box is `wrapperClassName`, and the field around label and messages (width, margins) is `fieldClassName`. |
| `size` | `ControlSize` | `"md"` | `sm` 32px, `md` 40px, `lg` 44px: the height of the bordered box, the same as a `Button` of that size. (Not the native `size` attribute.) |
| `label` | `React.ReactNode` | — | — |
| `ref` | `React.Ref<HTMLInputElement>` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `wrapperClassName` | `string` | — | Classes for the box that draws the border and the fill (`data-slot="input-wrapper"`). |
| `fieldClassName` | `string` | — | Classes for the whole field: label, box and messages (`data-slot="field-shell"`). |

Repassa também: atributos HTML do React (`HTMLAttributes`, `InputHTMLAttributes`).

### defaultNumberInputLabels

`import { defaultNumberInputLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/number-input"`

```ts
const defaultNumberInputLabels: NumberInputLabels = {
  increment: "Aumentar",
  decrement: "Diminuir",
}
```

### NumberInputLabels

`import type { NumberInputLabels } from "@amfernandesinc/ui"`

```ts
export interface NumberInputLabels {
  /** Name of the "+" stepper button. */
  increment: string
  /** Name of the "−" stepper button. */
  decrement: string
}
```

### NumberInputProps

`import type { NumberInputProps } from "@amfernandesinc/ui"`

```ts
export interface NumberInputProps
  extends Omit<
    InputProps,
    | "value"
    | "defaultValue"
    | "onChange"
    | "type"
    | "min"
    | "max"
    | "step"
    | "prefix"
    | "leadingIcon"
    | "trailingIcon"
    | "inputMode"
  > {
  /** The number, or `null` for an empty field (never `0` for empty). Controlled. */
  value?: number | null
  /** Initial value of an uncontrolled field. */
  defaultValue?: number | null
  /** Called with the number, or `null` when the field is emptied. */
  onValueChange?: (value: number | null) => void
  /** Decimal places allowed and shown (up to). `0` takes whole numbers only. @default 0 */
  decimals?: number
  /**
   * Smallest value. Applied when the field loses focus and on Enter, not while
   * typing. A negative `min` lets the minus sign be typed.
   */
  min?: number
  /** Largest value. Applied when the field loses focus and on Enter, not while typing. */
  max?: number
  /** What the arrows and the stepper buttons add or take. PageUp/PageDown move ten steps. @default 1 */
  step?: number
  /** Fixed text before the number, inside the field. */
  prefix?: React.ReactNode
  /** Unit after the number, inside the field ("m²", "andares"). */
  suffix?: React.ReactNode
  /** Shows − and + buttons in the field. They do not take focus from the input. */
  steppers?: boolean
  labels?: Partial<NumberInputLabels>
}
```

## `primitives/radio-group` — `@amfernandesinc/ui/radio-group`

### RadioGroup

`import { RadioGroup } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/radio-group"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | — |
| `options` | `RadioGroupItemData[]` | — | The choices, in order. |
| `values` | `RadioGroupItemData[]` | — | — |
| `id` | `string` | — | — |
| `ref` | `React.Ref<HTMLDivElement>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |

Repassa também: props de `@radix-ui/react-primitive`; props de `@radix-ui/react-radio-group` (`RadioGroupProps`); atributos HTML do React (`Attributes`, `HTMLAttributes`).

### RadioGroupItemData

`import type { RadioGroupItemData } from "@amfernandesinc/ui"`

```ts
export interface RadioGroupItemData {
  value: string
  label: React.ReactNode
  disabled?: boolean
  icon?: React.ComponentType<{ className?: string }>
}
```

### RadioGroupProps

`import type { RadioGroupProps } from "@amfernandesinc/ui"`

```ts
export interface RadioGroupProps
  extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Root>, "id" | "orientation"> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  orientation?: "vertical" | "horizontal"
  /** The choices, in order. */
  options?: RadioGroupItemData[]
  /** @deprecated Use `options`, the name every choice list in the library has. */
  values?: RadioGroupItemData[]
  id?: string
  ref?: React.Ref<HTMLDivElement>
}
```

## `primitives/segmented-control` — `@amfernandesinc/ui/segmented-control`

### SegmentedControl

`import { SegmentedControl } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/segmented-control"`

A row of mutually exclusive options with exactly one selected — an input, not navigation. Use it to switch how the same content is shown ("Lista | Grade", "Dia | Semana | Mês") or as a compact choice in a form. For switching between different panels of content use `Tabs`; for an independent on/off use `Toggle`. Built on Radix RadioGroup: `role="radiogroup"`, the four arrow keys move and select, one Tab stop for the whole group.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `options` | `SegmentedControlOption[]` | **obrigatória** | 2–5 mutually exclusive options, always visible. |
| `value` | `string` | — | — |
| `defaultValue` | `string` | — | — |
| `onValueChange` | `(value: string) => void` | — | — |
| `label` | `string` | **obrigatória** | Name of the group ("Visualização", "Período"). By default it is not drawn (`labelPosition="hidden"`): the options are expected to make sense on their own next to the content they control. In a form, draw it with `labelPosition="up"` or `"left"`. |
| `labelPosition` | `LabelPosition` | `"hidden"` | Where the label goes. |
| `description` | `React.ReactNode` | — | Help text under the control, read with the group. |
| `error` | `string` | — | Error message under the control: marks the group invalid and is read with it. |
| `fieldClassName` | `string` | — | Classes for the field around the control, label and messages. |
| `size` | `ControlSize` | `"md"` | `sm` 32px, `md` 40px, `lg` 44px: the height of the whole track, the same as a `Button` or an `Input` of that size. |
| `fill` | `boolean` | `false` | Stretch the segments equally to fill the container. |
| `iconOnly` | `boolean` | `false` | Show only the icons; each label becomes the accessible name and a tooltip. |
| `disabled` | `boolean` | — | — |
| `name` | `string` | — | Form field name. Renders a hidden input, so the choice is submitted with the form. |
| `required` | `boolean` | — | — |
| `className` | `string` | — | — |
| `ref` | `React.Ref<HTMLDivElement>` | — | — |

Repassa também: atributos HTML do React (`HTMLAttributes`).

### SegmentedControlOption

`import type { SegmentedControlOption } from "@amfernandesinc/ui"`

```ts
export interface SegmentedControlOption {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}
```

### SegmentedControlProps

`import type { SegmentedControlProps } from "@amfernandesinc/ui"`

```ts
export interface SegmentedControlProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange" | "children" | "dir"
  > {
  /** 2–5 mutually exclusive options, always visible. */
  options: SegmentedControlOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /**
   * Name of the group ("Visualização", "Período"). By default it is not drawn
   * (`labelPosition="hidden"`): the options are expected to make sense on
   * their own next to the content they control. In a form, draw it with
   * `labelPosition="up"` or `"left"`.
   */
  label: string
  /** Where the label goes. @default "hidden" */
  labelPosition?: LabelPosition
  /** Help text under the control, read with the group. */
  description?: React.ReactNode
  /** Error message under the control: marks the group invalid and is read with it. */
  error?: string
  /** Classes for the field around the control, label and messages. */
  fieldClassName?: string
  /**
   * `sm` 32px, `md` 40px, `lg` 44px: the height of the whole track, the same
   * as a `Button` or an `Input` of that size. @default "md"
   */
  size?: ControlSize
  /** Stretch the segments equally to fill the container. */
  fill?: boolean
  /** Show only the icons; each label becomes the accessible name and a tooltip. */
  iconOnly?: boolean
  disabled?: boolean
  /** Form field name. Renders a hidden input, so the choice is submitted with the form. */
  name?: string
  required?: boolean
  className?: string
  ref?: React.Ref<HTMLDivElement>
}
```

## `primitives/separator` — `@amfernandesinc/ui/separator`

### Separator

`import { Separator } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/separator"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `ref` | `React.Ref<HTMLDivElement>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |

Repassa também: props de `@radix-ui/react-primitive`; props de `@radix-ui/react-separator` (`SeparatorProps`); atributos HTML do React (`Attributes`, `HTMLAttributes`).

### SeparatorProps

`import type { SeparatorProps } from "@amfernandesinc/ui"`

```ts
export interface SeparatorProps
  extends Omit<React.ComponentProps<typeof SeparatorPrimitive.Root>, "children"> {
  ref?: React.Ref<HTMLDivElement>
}
```

## `primitives/skeleton` — `@amfernandesinc/ui/skeleton`

### Skeleton

`import { Skeleton } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/skeleton"`

A pulsing block in the shape of content that is still loading. It is only a picture (`aria-hidden`): a table of skeletons is not sixteen things to read. Put the blocks of one loading area in a `SkeletonGroup`, which tells screen readers, once, that it is loading.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `ref` | `React.Ref<HTMLDivElement>` | — | — |

Repassa também: atributos HTML do React (`HTMLAttributes`).

### SkeletonGroup

`import { SkeletonGroup } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/skeleton"`

The one status of a loading area (`role="status"`): its `Skeleton` blocks are hidden, and it says "Carregando…" in their place. Lay the blocks out inside it as the content will be.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `labels` | `Partial<SkeletonLabels>` | — | Text for screen readers. Defaults in `defaultSkeletonLabels`. |
| `ref` | `React.Ref<HTMLDivElement>` | — | — |

Repassa também: atributos HTML do React (`HTMLAttributes`).

### defaultSkeletonLabels

`import { defaultSkeletonLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/skeleton"`

```ts
const defaultSkeletonLabels: SkeletonLabels = {
  loading: "Carregando…",
}
```

### SkeletonGroupProps

`import type { SkeletonGroupProps } from "@amfernandesinc/ui"`

```ts
export interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Text for screen readers. Defaults in `defaultSkeletonLabels`. */
  labels?: Partial<SkeletonLabels>
  ref?: React.Ref<HTMLDivElement>
}
```

### SkeletonLabels

`import type { SkeletonLabels } from "@amfernandesinc/ui"`

```ts
export interface SkeletonLabels {
  /** Read once when the group appears. */
  loading: string
}
```

### SkeletonProps

`import type { SkeletonProps } from "@amfernandesinc/ui"`

```ts
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>
}
```

## `primitives/slider` — `@amfernandesinc/ui/slider`

### Slider

`import { Slider } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/slider"`

As props são uma união: cada forma abaixo é um jeito de usar o componente.

#### `SliderSingleProps`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `range` | `false` | — | — |
| `value` | `number` | — | — |
| `defaultValue` | `number` | — | — |
| `onValueChange` | `(value: number) => void` | — | — |
| `onValueCommit` | `(value: number) => void` | — | Called when a drag or a key press ends, with the final value. |
| `label` | `React.ReactNode` | — | — |
| `aria-label` | `string` | — | Name for a slider with no visible `label`. |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `disabled` | `boolean` | — | — |
| `min` | `number` | `0` | — |
| `max` | `number` | `100` | — |
| `step` | `number` | `1` | — |
| `showValue` | `boolean` | — | Shows the current value (or range) next to the label, formatted by `formatValue`. |
| `formatValue` | `(value: number) => string` | — | Text of a value: next to the label with `showValue`, and what a screen reader says for each thumb. Defaults to the Brazilian number format ("1.250", "2,5"). |
| `marks` | `Array<number \| SliderMark>` | — | Ticks under the track, with optional labels (`[0, 50, 100]` or `{ value, label }`). |
| `name` | `string` | — | Field name: a hidden input per thumb carries the value (a range sends the name twice). |
| `form` | `string` | — | — |
| `labels` | `Partial<SliderLabels>` | — | — |
| `id` | `string` | — | — |
| `className` | `string` | — | Class of the field (label, track, marks, messages). |
| `ref` | `React.Ref<HTMLSpanElement>` | — | — |

#### `SliderRangeProps`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `range` | `true` | **obrigatória** | Two thumbs: a minimum and a maximum. |
| `value` | `[number, number]` | — | — |
| `defaultValue` | `[number, number]` | — | — |
| `onValueChange` | `(value: [number, number]) => void` | — | — |
| `onValueCommit` | `(value: [number, number]) => void` | — | — |
| `minStepsBetweenThumbs` | `number` | `0` | Steps the two thumbs keep between them. |
| `label` | `React.ReactNode` | — | — |
| `aria-label` | `string` | — | Name for a slider with no visible `label`. |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `disabled` | `boolean` | — | — |
| `min` | `number` | `0` | — |
| `max` | `number` | `100` | — |
| `step` | `number` | `1` | — |
| `showValue` | `boolean` | — | Shows the current value (or range) next to the label, formatted by `formatValue`. |
| `formatValue` | `(value: number) => string` | — | Text of a value: next to the label with `showValue`, and what a screen reader says for each thumb. Defaults to the Brazilian number format ("1.250", "2,5"). |
| `marks` | `Array<number \| SliderMark>` | — | Ticks under the track, with optional labels (`[0, 50, 100]` or `{ value, label }`). |
| `name` | `string` | — | Field name: a hidden input per thumb carries the value (a range sends the name twice). |
| `form` | `string` | — | — |
| `labels` | `Partial<SliderLabels>` | — | — |
| `id` | `string` | — | — |
| `className` | `string` | — | Class of the field (label, track, marks, messages). |
| `ref` | `React.Ref<HTMLSpanElement>` | — | — |


### defaultSliderLabels

`import { defaultSliderLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/slider"`

```ts
const defaultSliderLabels: SliderLabels = {
  min: "mínimo",
  max: "máximo",
}
```

### SliderLabels

`import type { SliderLabels } from "@amfernandesinc/ui"`

```ts
export interface SliderLabels {
  /** Added to the name of the first thumb of a range ("Preço mínimo"). */
  min: string
  /** Added to the name of the second thumb of a range ("Preço máximo"). */
  max: string
}
```

### SliderMark

`import type { SliderMark } from "@amfernandesinc/ui"`

```ts
export interface SliderMark {
  value: number
  /** Text under the tick. Without it, only the tick shows. */
  label?: string
}
```

### SliderProps

`import type { SliderProps } from "@amfernandesinc/ui"`

```ts
export type SliderProps = SliderSingleProps | SliderRangeProps
```

### SliderRangeProps

`import type { SliderRangeProps } from "@amfernandesinc/ui"`

```ts
export interface SliderRangeProps extends SliderBaseProps {
  /** Two thumbs: a minimum and a maximum. */
  range: true
  value?: [number, number]
  defaultValue?: [number, number]
  onValueChange?: (value: [number, number]) => void
  onValueCommit?: (value: [number, number]) => void
  /** Steps the two thumbs keep between them. @default 0 */
  minStepsBetweenThumbs?: number
}
```

### SliderSingleProps

`import type { SliderSingleProps } from "@amfernandesinc/ui"`

```ts
export interface SliderSingleProps extends SliderBaseProps {
  range?: false
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Called when a drag or a key press ends, with the final value. */
  onValueCommit?: (value: number) => void
}
```

## `primitives/switch` — `@amfernandesinc/ui/switch`

### Switch

`import { Switch } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/switch"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `id` | `string` | — | — |
| `ref` | `React.Ref<HTMLButtonElement>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |

Repassa também: props de `@radix-ui/react-primitive`; props de `@radix-ui/react-switch` (`SwitchProps`); atributos HTML do React (`Attributes`, `ButtonHTMLAttributes`, `HTMLAttributes`).

### SwitchProps

`import type { SwitchProps } from "@amfernandesinc/ui"`

```ts
export interface SwitchProps extends Omit<React.ComponentProps<typeof SwitchPrimitive.Root>, "id"> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  id?: string
  ref?: React.Ref<HTMLButtonElement>
}
```

## `primitives/textarea` — `@amfernandesinc/ui/textarea`

### Textarea

`import { Textarea } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/textarea"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `label` | `React.ReactNode` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `required` | `boolean` | — | — |
| `autoResize` | `boolean` | — | — |
| `maxLength` | `number` | — | Besides limiting what can be typed, shows a counter ("27/500"). The counter is part of the field's description, read when the field gets focus; it is not announced at every key. Reaching the limit is announced once. |
| `labels` | `Partial<TextareaLabels>` | — | Text for screen readers. Defaults in `defaultTextareaLabels`. |
| `size` | `ControlSize` | `"md"` | Minimum height and padding: with `rows={1}` the box is 32px (`sm`), 40px (`md`) or 44px (`lg`), the height of an `Input` of that size. More rows and `autoResize` grow from there. |
| `ref` | `React.Ref<HTMLTextAreaElement>` | — | — |

Repassa também: atributos HTML do React (`HTMLAttributes`, `TextareaHTMLAttributes`).

### defaultTextareaLabels

`import { defaultTextareaLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/textarea"`

```ts
const defaultTextareaLabels: TextareaLabels = {
  characterCount: (count, max) => `${count} de ${max} caracteres`,
  limitReached: (max) => `Limite de ${max} caracteres atingido`,
}
```

### TextareaLabels

`import type { TextareaLabels } from "@amfernandesinc/ui"`

```ts
export interface TextareaLabels {
  /** How a screen reader reads the counter, shown on screen as "27/500". */
  characterCount: (count: number, max: number) => string
  /** Announced once, when what is typed reaches `maxLength`. */
  limitReached: (max: number) => string
}
```

### TextareaProps

`import type { TextareaProps } from "@amfernandesinc/ui"`

```ts
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode
  labelPosition?: LabelPosition
  description?: React.ReactNode
  error?: string
  required?: boolean
  autoResize?: boolean
  /**
   * Besides limiting what can be typed, shows a counter ("27/500"). The
   * counter is part of the field's description, read when the field gets
   * focus; it is not announced at every key. Reaching the limit is announced
   * once.
   */
  maxLength?: number
  /** Text for screen readers. Defaults in `defaultTextareaLabels`. */
  labels?: Partial<TextareaLabels>
  /**
   * Minimum height and padding: with `rows={1}` the box is 32px (`sm`), 40px
   * (`md`) or 44px (`lg`), the height of an `Input` of that size. More rows
   * and `autoResize` grow from there.
   * @default "md"
   */
  size?: ControlSize
  ref?: React.Ref<HTMLTextAreaElement>
}
```

## `primitives/toggle` — `@amfernandesinc/ui/toggle`

### Toggle

`import { Toggle } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/toggle"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `size` | `ControlSize \| "default"` | `"md"` | `sm` 32px, `md` 40px, `lg` 44px: the height of the whole box, the same as a `Button` or an `Input` of that size. `"default"` is the deprecated name of `"md"` and still works. |
| `ref` | `React.Ref<React.ElementRef<typeof TogglePrimitive.Root>>` | — | — |
| `variant` | `"default" \| "info" \| "success" \| "warning" \| "destructive"` | `"default"` | — |

Repassa também: props de `@radix-ui/react-toggle` (`ToggleProps`); atributos HTML do React (`Attributes`, `ButtonHTMLAttributes`, `HTMLAttributes`).

### toggleVariants

`import { toggleVariants } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/toggle"`

Button-like control whose value is binary (on / off). Separate from `Button` because the visual job is different: `Button` communicates **action hierarchy** — primary, secondary, destructive. Adding semantic colours there confuses consumers about what's the page's main action. `Toggle` communicates **state**. When pressed it picks up the variant's colour so the on/off distinction reads at a glance (the way GitHub's "Watch" button, Trello's "Watching" eye, or Gmail's star do). Off-state is always a neutral outline so multiple toggles side-by-side don't fight for attention. Backed by Radix's `Toggle` primitive, so the controlled API (`pressed` / `onPressedChange`) and `data-state` attributes are standard. Keep the label the same in both states: `aria-pressed` is what says "on". A label that flips ("Remover da lista" when pressed) is read as "Remover da lista, pressionado" — the opposite of what the screen shows.

Gera as classes do componente (class-variance-authority).

Variantes:

- `variant`: `default`, `info`, `success`, `warning`, `destructive` (padrão `"default"`)
- `size`: `sm`, `md`, `lg`, `default` (padrão `"md"`)

### ToggleProps

`import type { ToggleProps } from "@amfernandesinc/ui"`

```ts
export interface ToggleProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>, "asChild">,
    VariantProps<typeof toggleVariants> {
  /**
   * `sm` 32px, `md` 40px, `lg` 44px: the height of the whole box, the same as
   * a `Button` or an `Input` of that size. `"default"` is the deprecated name
   * of `"md"` and still works.
   * @default "md"
   */
  size?: ControlSize | "default"
  ref?: React.Ref<React.ElementRef<typeof TogglePrimitive.Root>>
}
```

## `primitives/token` — `@amfernandesinc/ui/token`

### Token

`import { Token } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/token"`

Compact tinted chip for inline metadata, filters and selections — removable, clickable or a link. For a solid status label ("Aprovado", "Pendente") use `Badge`. The clickable part and the remove button are siblings (never nested): the label's hit area is stretched over the whole chip, with the × on top.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `label` | `string` | **obrigatória** | — |
| `color` | `TokenColor` | `"gray"` | Categorical colour. |
| `size` | `"sm" \| "md"` | `"md"` | — |
| `icon` | `React.ComponentType<{ className?: string }>` | — | — |
| `onRemove` | `() => void` | — | Renders an × button ("Remover {label}"). |
| `onClick` | `(event: React.MouseEvent<HTMLElement>) => void` | — | Makes the whole token a button; with `href`, runs on the link's click. Receives the event: `event.preventDefault()` stops the link. |
| `href` | `string` | — | Makes the whole token a link. Unsafe protocols (`javascript:`…) are dropped and the token renders as plain text (or a button with `onClick`). |
| `renderLink` | `RenderLink` | — | Renders the link with your router's `<Link>`, so it navigates without reloading the page: `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`. Pass every prop on: they carry the classes and the click handler. |
| `target` | `React.HTMLAttributeAnchorTarget` | — | Link target. `"_blank"` also sets `rel="noopener noreferrer"`. |
| `disabled` | `boolean` | `false` | — |
| `labels` | `Partial<TokenLabels>` | — | — |
| `className` | `string` | — | — |
| `ref` | `React.Ref<HTMLSpanElement>` | — | — |

Repassa também: atributos HTML do React (`HTMLAttributes`).

### defaultTokenLabels

`import { defaultTokenLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/token"`

```ts
const defaultTokenLabels: TokenLabels = {
  remove: (label) => `Remover ${label}`,
}
```

### TokenColor

`import type { TokenColor } from "@amfernandesinc/ui"`

```ts
export type TokenColor =
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "purple"
  | "pink"
```

### TokenLabels

`import type { TokenLabels } from "@amfernandesinc/ui"`

```ts
export interface TokenLabels {
  /** Accessible name of the remove button. */
  remove: (label: string) => string
}
```

### TokenProps

`import type { TokenProps } from "@amfernandesinc/ui"`

```ts
export interface TokenProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onClick" | "children" | "color"> {
  label: string
  /** Categorical colour. @default "gray" */
  color?: TokenColor
  /** @default "md" */
  size?: "sm" | "md"
  icon?: React.ComponentType<{ className?: string }>
  /** Renders an × button ("Remover {label}"). */
  onRemove?: () => void
  /**
   * Makes the whole token a button; with `href`, runs on the link's click.
   * Receives the event: `event.preventDefault()` stops the link.
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  /**
   * Makes the whole token a link. Unsafe protocols (`javascript:`…) are
   * dropped and the token renders as plain text (or a button with `onClick`).
   */
  href?: string
  /**
   * Renders the link with your router's `<Link>`, so it navigates without
   * reloading the page: `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`.
   * Pass every prop on: they carry the classes and the click handler.
   */
  renderLink?: RenderLink
  /** Link target. `"_blank"` also sets `rel="noopener noreferrer"`. */
  target?: React.HTMLAttributeAnchorTarget
  disabled?: boolean
  labels?: Partial<TokenLabels>
  className?: string
  ref?: React.Ref<HTMLSpanElement>
}
```

## `primitives/typography` — `@amfernandesinc/ui/typography`

### Typography

`import { Typography } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/typography"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `as` | `TypographyAs` | — | Override the rendered element. Defaults to a semantic tag per variant. |
| `ref` | `React.Ref<HTMLElement>` | — | — |
| `variant` | `"caption" \| "heading" \| "title" \| "subtitle" \| "lead" \| "body"` | `"body"` | — |

Repassa também: atributos HTML do React (`HTMLAttributes`).

### typographyVariants

`import { typographyVariants } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/typography"`

Gera as classes do componente (class-variance-authority).

Variantes:

- `variant`: `heading`, `title`, `subtitle`, `lead`, `body`, `caption` (padrão `"body"`)

### TypographyAs

`import type { TypographyAs } from "@amfernandesinc/ui"`

```ts
export type TypographyAs =
  | "div"
  | "span"
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "label"
  | "small"
  | "blockquote"
```

### TypographyProps

`import type { TypographyProps } from "@amfernandesinc/ui"`

```ts
export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  /** Override the rendered element. Defaults to a semantic tag per variant. */
  as?: TypographyAs
  ref?: React.Ref<HTMLElement>
}
```
