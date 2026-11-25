<!-- Gerado por `bun run skill:api` a partir de src/. Não edite à mão: o teste scripts/lib/skill-api.test.ts falha se este arquivo e o código divergirem. -->

# API: Formulários

## `forms/calendar` — `@amfernandesinc/ui/calendar`

### Calendar

`import { Calendar } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/calendar"`

As props são uma união: cada forma abaixo é um jeito de usar o componente.

#### `PropsBase & PropsSingle & { buttonVariant?: React.ComponentProps<typeof Button>["variant"]; disabledDays?: DisabledDays; labels?: Partial<Labels> & Partial<CalendarLabels>; ref?: React.Ref<HTMLDivElement>; }`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `labels` | `Partial<Labels> & Partial<CalendarLabels>` | — | Labels creators to override the defaults. Use this prop to customize the aria-label attributes in DayPicker. Texts read by screen readers: react-day-picker's (`labelNext`, `labelDayButton`…, Portuguese by default) and the quick navigation's (`chooseYear`, `chooseMonth`, `backToYears`, defaults in `defaultCalendarLabels`). |
| `buttonVariant` | `React.ComponentProps<typeof Button>["variant"]` | `"ghost"` | — |
| `disabledDays` | `DisabledDays` | — | Disable specific days. Accepts a Date, Date[], preset string, preset[], or custom predicate. Takes precedence over `disabled` if both are provided. |
| `ref` | `React.Ref<HTMLDivElement>` | — | — |

Repassa também: props de `react-day-picker` (`PropsBase`, `PropsSingle`).

#### `PropsBase & PropsSingleRequired & { buttonVariant?: React.ComponentProps<typeof Button>["variant"]; disabledDays?: DisabledDays; labels?: Partial<Labels> & Partial<CalendarLabels>; ref?: React.Ref<HTMLDivElement>; }`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `labels` | `Partial<Labels> & Partial<CalendarLabels>` | — | Labels creators to override the defaults. Use this prop to customize the aria-label attributes in DayPicker. Texts read by screen readers: react-day-picker's (`labelNext`, `labelDayButton`…, Portuguese by default) and the quick navigation's (`chooseYear`, `chooseMonth`, `backToYears`, defaults in `defaultCalendarLabels`). |
| `buttonVariant` | `React.ComponentProps<typeof Button>["variant"]` | `"ghost"` | — |
| `disabledDays` | `DisabledDays` | — | Disable specific days. Accepts a Date, Date[], preset string, preset[], or custom predicate. Takes precedence over `disabled` if both are provided. |
| `ref` | `React.Ref<HTMLDivElement>` | — | — |

Repassa também: props de `react-day-picker` (`PropsBase`, `PropsSingleRequired`).

#### `PropsBase & PropsMulti & { buttonVariant?: React.ComponentProps<typeof Button>["variant"]; disabledDays?: DisabledDays; labels?: Partial<Labels> & Partial<CalendarLabels>; ref?: React.Ref<HTMLDivElement>; }`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `labels` | `Partial<Labels> & Partial<CalendarLabels>` | — | Labels creators to override the defaults. Use this prop to customize the aria-label attributes in DayPicker. Texts read by screen readers: react-day-picker's (`labelNext`, `labelDayButton`…, Portuguese by default) and the quick navigation's (`chooseYear`, `chooseMonth`, `backToYears`, defaults in `defaultCalendarLabels`). |
| `buttonVariant` | `React.ComponentProps<typeof Button>["variant"]` | `"ghost"` | — |
| `disabledDays` | `DisabledDays` | — | Disable specific days. Accepts a Date, Date[], preset string, preset[], or custom predicate. Takes precedence over `disabled` if both are provided. |
| `ref` | `React.Ref<HTMLDivElement>` | — | — |

Repassa também: props de `react-day-picker` (`PropsBase`, `PropsMulti`).

#### `PropsBase & PropsMultiRequired & { buttonVariant?: React.ComponentProps<typeof Button>["variant"]; disabledDays?: DisabledDays; labels?: Partial<Labels> & Partial<CalendarLabels>; ref?: React.Ref<HTMLDivElement>; }`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `labels` | `Partial<Labels> & Partial<CalendarLabels>` | — | Labels creators to override the defaults. Use this prop to customize the aria-label attributes in DayPicker. Texts read by screen readers: react-day-picker's (`labelNext`, `labelDayButton`…, Portuguese by default) and the quick navigation's (`chooseYear`, `chooseMonth`, `backToYears`, defaults in `defaultCalendarLabels`). |
| `buttonVariant` | `React.ComponentProps<typeof Button>["variant"]` | `"ghost"` | — |
| `disabledDays` | `DisabledDays` | — | Disable specific days. Accepts a Date, Date[], preset string, preset[], or custom predicate. Takes precedence over `disabled` if both are provided. |
| `ref` | `React.Ref<HTMLDivElement>` | — | — |

Repassa também: props de `react-day-picker` (`PropsBase`, `PropsMultiRequired`).

#### `PropsBase & PropsRange & { buttonVariant?: React.ComponentProps<typeof Button>["variant"]; disabledDays?: DisabledDays; labels?: Partial<Labels> & Partial<CalendarLabels>; ref?: React.Ref<HTMLDivElement>; }`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `labels` | `Partial<Labels> & Partial<CalendarLabels>` | — | Labels creators to override the defaults. Use this prop to customize the aria-label attributes in DayPicker. Texts read by screen readers: react-day-picker's (`labelNext`, `labelDayButton`…, Portuguese by default) and the quick navigation's (`chooseYear`, `chooseMonth`, `backToYears`, defaults in `defaultCalendarLabels`). |
| `buttonVariant` | `React.ComponentProps<typeof Button>["variant"]` | `"ghost"` | — |
| `disabledDays` | `DisabledDays` | — | Disable specific days. Accepts a Date, Date[], preset string, preset[], or custom predicate. Takes precedence over `disabled` if both are provided. |
| `ref` | `React.Ref<HTMLDivElement>` | — | — |

Repassa também: props de `react-day-picker` (`PropsBase`, `PropsRange`).

#### `PropsBase & PropsRangeRequired & { buttonVariant?: React.ComponentProps<typeof Button>["variant"]; disabledDays?: DisabledDays; labels?: Partial<Labels> & Partial<CalendarLabels>; ref?: React.Ref<HTMLDivElement>; }`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `labels` | `Partial<Labels> & Partial<CalendarLabels>` | — | Labels creators to override the defaults. Use this prop to customize the aria-label attributes in DayPicker. Texts read by screen readers: react-day-picker's (`labelNext`, `labelDayButton`…, Portuguese by default) and the quick navigation's (`chooseYear`, `chooseMonth`, `backToYears`, defaults in `defaultCalendarLabels`). |
| `buttonVariant` | `React.ComponentProps<typeof Button>["variant"]` | `"ghost"` | — |
| `disabledDays` | `DisabledDays` | — | Disable specific days. Accepts a Date, Date[], preset string, preset[], or custom predicate. Takes precedence over `disabled` if both are provided. |
| `ref` | `React.Ref<HTMLDivElement>` | — | — |

Repassa também: props de `react-day-picker` (`PropsBase`, `PropsRangeRequired`).

#### `PropsBase & { mode?: undefined; required?: undefined; } & { buttonVariant?: React.ComponentProps<typeof Button>["variant"]; disabledDays?: DisabledDays; labels?: Partial<Labels> & Partial<CalendarLabels>; ref?: React.Ref<HTMLDivElement>; }`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `labels` | `Partial<Labels> & Partial<CalendarLabels>` | — | Labels creators to override the defaults. Use this prop to customize the aria-label attributes in DayPicker. Texts read by screen readers: react-day-picker's (`labelNext`, `labelDayButton`…, Portuguese by default) and the quick navigation's (`chooseYear`, `chooseMonth`, `backToYears`, defaults in `defaultCalendarLabels`). |
| `buttonVariant` | `React.ComponentProps<typeof Button>["variant"]` | `"ghost"` | — |
| `disabledDays` | `DisabledDays` | — | Disable specific days. Accepts a Date, Date[], preset string, preset[], or custom predicate. Takes precedence over `disabled` if both are provided. |
| `ref` | `React.Ref<HTMLDivElement>` | — | — |

Repassa também: props de `react-day-picker` (`PropsBase`).


### defaultCalendarLabels

`import { defaultCalendarLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/calendar"`

```ts
const defaultCalendarLabels: CalendarLabels = {
  chooseYear: "Escolher ano",
  chooseMonth: "Escolher mês",
  backToYears: (year) => `${year} — voltar para a seleção de ano`,
}
```

### CalendarLabels

`import type { CalendarLabels } from "@amfernandesinc/ui"`

Texts of the Calendar's quick navigation (years and months).

```ts
export interface CalendarLabels {
  /** Name of the grid of years. */
  chooseYear: string
  /** Name of the grid of months. */
  chooseMonth: string
  /** The button that goes back from the months to the years. */
  backToYears: (year: number) => string
}
```

### CalendarProps

`import type { CalendarProps } from "@amfernandesinc/ui"`

```ts
export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  /**
   * Disable specific days. Accepts a Date, Date[], preset string, preset[], or custom predicate.
   * Takes precedence over `disabled` if both are provided.
   */
  disabledDays?: DisabledDays
  /**
   * Texts read by screen readers: react-day-picker's (`labelNext`,
   * `labelDayButton`…, Portuguese by default) and the quick navigation's
   * (`chooseYear`, `chooseMonth`, `backToYears`, defaults in
   * `defaultCalendarLabels`).
   */
  labels?: Partial<Labels> & Partial<CalendarLabels>
  ref?: React.Ref<HTMLDivElement>
}
```

### DisabledDayPreset

`import type { DisabledDayPreset } from "@amfernandesinc/ui"`

Preset matchers that translate to a date-fns predicate at render time.

```ts
export type DisabledDayPreset = "past" | "future" | "weekends" | "weekdays" | "today"
```

### DisabledDays

`import type { DisabledDays } from "@amfernandesinc/ui"`

```ts
export type DisabledDays =
  | Date
  | Date[]
  | DisabledDayPreset
  | DisabledDayPreset[]
  | ((date: Date) => boolean)
```

## `forms/combobox` — `@amfernandesinc/ui/combobox`

### Combobox

`import { Combobox } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/combobox"`

As props são uma união: cada forma abaixo é um jeito de usar o componente.

#### `ComboboxSingleProps`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `multiple` | `false` | — | — |
| `value` | `string` | — | The chosen value, controlled. Leave it out to let the field keep its own. |
| `defaultValue` | `string` | — | Initial value of an uncontrolled field. |
| `onValueChange` | `(value: string) => void` | — | — |
| `options` | `ComboboxOption[]` | **obrigatória** | — |
| `placeholder` | `string` | — | — |
| `searchPlaceholder` | `string` | — | — |
| `emptyMessage` | `string` | — | — |
| `disabled` | `boolean` | — | — |
| `className` | `string` | — | — |
| `popoverWidth` | `string` | — | — |
| `creatable` | `boolean` | — | — |
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `required` | `boolean` | — | — |
| `id` | `string` | — | — |
| `onSearchChange` | `(search: string) => void` | — | Called with the search text as the user types (and with `""` when the list closes). For a search on the server, pass the results in `options` and turn the local filter off with `shouldFilter={false}`. |
| `loading` | `boolean` | — | The options are being fetched: the list says so instead of "nothing found". |
| `shouldFilter` | `boolean` | `true` | `false` shows `options` exactly as given, without filtering them by the search: for options that already come filtered from the server. |
| `maxVisibleOptions` | `number` | `100` | Most options rendered at once. With a long list only the first matches are on screen (plus the chosen ones), and a line says how many were left out and asks to keep typing. Opening and typing stay fast with thousands of options. |
| `name` | `string` | — | Name of the field in a native form. The form receives the raw value (the option's `value`; in multiple mode, the values joined by commas), carried by a hidden input. |
| `readOnly` | `boolean` | — | Shows the choice without letting it change: the trigger stays readable and focusable, the list does not open, there is no clear button and the value is submitted with the form. For a view-only screen; `disabled` is for a field that does not apply. |
| `size` | `ControlSize` | `"md"` | Height of the trigger: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or input of that size. |
| `onBlur` | `(event: React.FocusEvent<HTMLElement>) => void` | — | Called when the focus leaves the field as a whole. Moving between the trigger, the clear and remove buttons and the open list does not count. |
| `labels` | `Partial<ComboboxLabels>` | — | Texts of the list. Defaults in `defaultComboboxLabels`. |
| `ref` | `React.Ref<HTMLButtonElement>` | — | — |

#### `ComboboxMultipleProps`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `multiple` | `true` | **obrigatória** | — |
| `value` | `string[]` | — | The chosen values, controlled. Leave it out to let the field keep its own. |
| `defaultValue` | `string[]` | — | Initial values of an uncontrolled field. |
| `onValueChange` | `(value: string[]) => void` | — | — |
| `maxBadges` | `number` | — | — |
| `showBadges` | `boolean` | — | Hide the chip row that sits above the trigger. With many selections the chips wrap and push surrounding rows around — set `false` for a compact filter row where only the count in the trigger matters. Defaults to `true` to preserve existing behaviour. |
| `selectedCountLabel` | `(count: number) => string` | — | Override the trigger label when the user has selected at least one option. Receives the current count; return the full string. Default is "N selecionado" / "N selecionados". Useful for noun agreement (e.g. `n => n === 1 ? "1 jornada selecionada" : ${n} jornadas selecionadas`). |
| `options` | `ComboboxOption[]` | **obrigatória** | — |
| `placeholder` | `string` | — | — |
| `searchPlaceholder` | `string` | — | — |
| `emptyMessage` | `string` | — | — |
| `disabled` | `boolean` | — | — |
| `className` | `string` | — | — |
| `popoverWidth` | `string` | — | — |
| `creatable` | `boolean` | — | — |
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `required` | `boolean` | — | — |
| `id` | `string` | — | — |
| `onSearchChange` | `(search: string) => void` | — | Called with the search text as the user types (and with `""` when the list closes). For a search on the server, pass the results in `options` and turn the local filter off with `shouldFilter={false}`. |
| `loading` | `boolean` | — | The options are being fetched: the list says so instead of "nothing found". |
| `shouldFilter` | `boolean` | `true` | `false` shows `options` exactly as given, without filtering them by the search: for options that already come filtered from the server. |
| `maxVisibleOptions` | `number` | `100` | Most options rendered at once. With a long list only the first matches are on screen (plus the chosen ones), and a line says how many were left out and asks to keep typing. Opening and typing stay fast with thousands of options. |
| `name` | `string` | — | Name of the field in a native form. The form receives the raw value (the option's `value`; in multiple mode, the values joined by commas), carried by a hidden input. |
| `readOnly` | `boolean` | — | Shows the choice without letting it change: the trigger stays readable and focusable, the list does not open, there is no clear button and the value is submitted with the form. For a view-only screen; `disabled` is for a field that does not apply. |
| `size` | `ControlSize` | `"md"` | Height of the trigger: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or input of that size. |
| `onBlur` | `(event: React.FocusEvent<HTMLElement>) => void` | — | Called when the focus leaves the field as a whole. Moving between the trigger, the clear and remove buttons and the open list does not count. |
| `labels` | `Partial<ComboboxLabels>` | — | Texts of the list. Defaults in `defaultComboboxLabels`. |
| `ref` | `React.Ref<HTMLButtonElement>` | — | — |


### useComboboxOptions

`import { useComboboxOptions } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/combobox"`

```ts
useComboboxOptions<T extends { id: number | string; nome?: string; label?: string }>(data: T[] | undefined, labelKey: keyof T = "nome" as keyof T): ComboboxOption[]
```

### defaultComboboxLabels

`import { defaultComboboxLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/combobox"`

```ts
const defaultComboboxLabels: ComboboxLabels = {
  placeholder: "Selecione...",
  search: "Buscar...",
  list: "Opções",
  empty: "Nenhuma opção encontrada.",
  clear: "Limpar seleção",
  remove: (label) => `Remover ${label}`,
  create: (term) => `Usar: “${term}”`,
  loading: "Carregando…",
  hiddenOptions: (count) =>
    `${countFormatter.format(count)} ${count === 1 ? "opção a mais" : "opções a mais"}. Continue digitando para filtrar.`,
}
```

### ComboboxLabels

`import type { ComboboxLabels } from "@amfernandesinc/ui"`

```ts
export interface ComboboxLabels {
  /** The trigger with nothing chosen. `placeholder` wins over it. */
  placeholder: string
  /** The search box of the list. `searchPlaceholder` wins over it. */
  search: string
  /** Accessible name of the list of options. */
  list: string
  /** When nothing matches the search. `emptyMessage` wins over it. */
  empty: string
  /** The button that clears the choice. */
  clear: string
  /** The × of a chosen item, in multiple mode. Receives the item's label. */
  remove: (label: string) => string
  /** The option that uses the typed text, with `creatable`. */
  create: (term: string) => string
  /** Shown instead of the empty message while `loading`. */
  loading: string
  /**
   * The line under a long list, when only the first `maxVisibleOptions`
   * matches are on screen. Receives how many are left out.
   */
  hiddenOptions: (count: number) => string
}
```

### ComboboxOption

`import type { ComboboxOption } from "@amfernandesinc/ui"`

```ts
export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
  /**
   * Other words that find this option in the search, besides its label (a
   * code, an old name, a synonym). The search never looks at `value`.
   */
  keywords?: string[]
}
```

### ComboboxProps

`import type { ComboboxProps } from "@amfernandesinc/ui"`

```ts
export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps
```

## `forms/date-input` — `@amfernandesinc/ui/date-input`

### DateInput

`import { DateInput } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/date-input"`

A date field: type it (`dd/mm/aaaa`, the separators come by themselves) or pick it in the calendar of the button at the end. The value is the ISO date (`yyyy-MM-dd`), with no time and no time zone.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `id` | `string` | — | — |
| `value` | `string` | — | The date as an ISO string (`"yyyy-MM-dd"`), or `""` for no date, controlled. It changes only when the typed text is a whole valid date, when a day is picked in the calendar, or (to `""`) when the field is emptied or left with a date that is not valid. Leave it out to let the field keep its own date, starting from `defaultValue`. |
| `defaultValue` | `string` | — | Initial date (ISO) of an uncontrolled field. |
| `onValueChange` | `(value: string) => void` | — | Called with the new ISO date, or `""`. |
| `onChange` | `(value: string) => void` | — | — |
| `disabled` | `boolean` | — | — |
| `className` | `string` | — | — |
| `placeholder` | `string` | `"dd/mm/aaaa"` | — |
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | Error message. While it is set, it replaces the field's own message for an invalid date. |
| `labelPosition` | `LabelPosition` | — | — |
| `required` | `boolean` | — | — |
| `disabledDays` | `DisabledDays` | — | Forwarded to the underlying Calendar's `disabledDays` — accepts a preset ("past" \| "future" \| "weekends" \| "weekdays" \| "today"), a Date / Date[], or a custom predicate. Use this to lock the picker to a valid range (e.g. `disabledDays="future"` for birthdates or event entry dates). |
| `min` | `string` | — | First date allowed (ISO). Days before it are off in the calendar, and a typed date before it is an error when the field is left. |
| `max` | `string` | — | Last date allowed (ISO), as `min`. |
| `name` | `string` | — | Name of the field in a native form. The form receives the ISO date (what `onValueChange` reports), carried by a hidden input; the visible input, which shows `dd/mm/aaaa`, has no name. |
| `onBlur` | `(event: React.FocusEvent<HTMLElement>) => void` | — | Called when the focus leaves the field as a whole, after an invalid date was turned into `""`. Moving between the text, the calendar button and the open calendar does not count. |
| `readOnly` | `boolean` | `false` | Shows the date without letting it be edited: it stays readable, takes focus, can be copied and is submitted with the form; the calendar button goes away. For a view-only screen; `disabled` is for a field that does not apply. |
| `size` | `ControlSize` | `"md"` | Height of the field: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or input of that size. |
| `labels` | `Partial<DateInputLabels>` | — | Texts of the field. Defaults in `defaultDateInputLabels`. |
| `aria-label` | `string` | — | — |
| `ref` | `React.Ref<HTMLInputElement>` | — | The text field. |

### defaultDateInputLabels

`import { defaultDateInputLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/date-input"`

```ts
const defaultDateInputLabels: DateInputLabels = {
  openCalendar: "Abrir calendário",
  invalidDate: "Data inválida. Use o formato dd/mm/aaaa.",
  field: "Data",
  beforeMin: (min) => `A data deve ser a partir de ${min}.`,
  afterMax: (max) => `A data deve ser até ${max}.`,
  unavailableDate: "Esta data não está disponível.",
}
```

### DateInputLabels

`import type { DateInputLabels } from "@amfernandesinc/ui"`

```ts
export interface DateInputLabels {
  /** Accessible name of the button that opens the calendar. */
  openCalendar: string
  /** Shown when the field is left with an incomplete date or a day that does not exist. */
  invalidDate: string
  /** Accessible name of the field when it has neither `label` nor `aria-label`. */
  field: string
  /** Shown when the field is left with a date before `min` (given as dd/mm/aaaa). */
  beforeMin: (min: string) => string
  /** Shown when the field is left with a date after `max` (given as dd/mm/aaaa). */
  afterMax: (max: string) => string
  /** Shown when the field is left with a day that `disabledDays` rules out. */
  unavailableDate: string
}
```

### DateInputProps

`import type { DateInputProps } from "@amfernandesinc/ui"`

```ts
export interface DateInputProps {
  id?: string
  /**
   * The date as an ISO string (`"yyyy-MM-dd"`), or `""` for no date,
   * controlled. It changes only when the typed text is a whole valid date,
   * when a day is picked in the calendar, or (to `""`) when the field is
   * emptied or left with a date that is not valid. Leave it out to let the
   * field keep its own date, starting from `defaultValue`.
   */
  value?: string
  /** Initial date (ISO) of an uncontrolled field. */
  defaultValue?: string
  /** Called with the new ISO date, or `""`. */
  onValueChange?: (value: string) => void
  /** @deprecated Use `onValueChange`; it receives the same value. */
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  /** @default "dd/mm/aaaa" */
  placeholder?: string
  label?: React.ReactNode
  description?: React.ReactNode
  /**
   * Error message. While it is set, it replaces the field's own message for
   * an invalid date.
   */
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  /**
   * Forwarded to the underlying Calendar's `disabledDays` — accepts a
   * preset ("past" | "future" | "weekends" | "weekdays" | "today"), a
   * Date / Date[], or a custom predicate. Use this to lock the picker
   * to a valid range (e.g. `disabledDays="future"` for birthdates or
   * event entry dates).
   */
  disabledDays?: DisabledDays
  /**
   * First date allowed (ISO). Days before it are off in the calendar, and a
   * typed date before it is an error when the field is left.
   */
  min?: string
  /** Last date allowed (ISO), as `min`. */
  max?: string
  /**
   * Name of the field in a native form. The form receives the ISO date (what
   * `onValueChange` reports), carried by a hidden input; the visible input,
   * which shows `dd/mm/aaaa`, has no name.
   */
  name?: string
  /**
   * Called when the focus leaves the field as a whole, after an invalid date
   * was turned into `""`. Moving between the text, the calendar button and
   * the open calendar does not count.
   */
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void
  /**
   * Shows the date without letting it be edited: it stays readable, takes
   * focus, can be copied and is submitted with the form; the calendar button
   * goes away. For a view-only screen; `disabled` is for a field that does
   * not apply.
   */
  readOnly?: boolean
  /**
   * Height of the field: `sm` 32px, `md` 40px, `lg` 44px, the same as a
   * button or input of that size.
   * @default "md"
   */
  size?: ControlSize
  /** Texts of the field. Defaults in `defaultDateInputLabels`. */
  labels?: Partial<DateInputLabels>
  "aria-label"?: string
  /** The text field. */
  ref?: React.Ref<HTMLInputElement>
}
```

## `forms/date-range-picker` — `@amfernandesinc/ui/date-range-picker`

### DateRangePicker

`import { DateRangePicker } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/date-range-picker"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `required` | `boolean` | — | — |
| `disabled` | `boolean` | — | — |
| `value` | `DateRangeValue` | — | The period, controlled: ISO dates (`"yyyy-MM-dd"`), `""` for an open end. Leave it out to let the picker keep its own, starting from `defaultValue`. |
| `defaultValue` | `DateRangeValue` | — | Initial period of an uncontrolled picker. |
| `onValueChange` | `(value: DateRangeValue) => void` | — | Called when the period is confirmed or cleared. |
| `placeholder` | `string` | `"Selecione um período"` | — |
| `className` | `string` | — | — |
| `numberOfMonths` | `number` | `2` | — |
| `disabledDays` | `DisabledDays` | — | Days that cannot be picked: a preset ("past" \| "future" \| "weekends" \| "weekdays" \| "today"), a Date / Date[], or a predicate. For example, `disabledDays="future"` for a period that already happened. |
| `min` | `string` | — | First day that can be picked (ISO). The calendar does not go before its month. |
| `max` | `string` | — | Last day that can be picked (ISO). The calendar does not go past its month. |
| `id` | `string` | — | — |
| `name` | `string` | — | Name of the field in a native form: it sends two values, `<name>-from` and `<name>-to`, with the ISO dates (`""` for an open end). |
| `readOnly` | `boolean` | `false` | Shows the period without letting it change: the trigger stays readable and focusable, the calendar does not open, and the period is submitted with the form. For a view-only screen; `disabled` is for a field that does not apply. |
| `size` | `ControlSize` | `"md"` | Height of the trigger: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or input of that size. |
| `onBlur` | `(event: React.FocusEvent<HTMLElement>) => void` | — | Called when the focus leaves the picker as a whole. Moving into the open calendar and its buttons does not count. |
| `labels` | `Partial<DateRangePickerLabels>` | — | Texts of the picker. Defaults in `defaultDateRangePickerLabels`. |
| `aria-label` | `string` | — | — |
| `ref` | `React.Ref<HTMLButtonElement>` | — | — |

### defaultDateRangePickerLabels

`import { defaultDateRangePickerLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/date-range-picker"`

```ts
const defaultDateRangePickerLabels: DateRangePickerLabels = {
  clear: "Limpar",
  confirm: "Confirmar",
  field: "Período",
  required: "obrigatório",
}
```

### DateRangePickerLabels

`import type { DateRangePickerLabels } from "@amfernandesinc/ui"`

```ts
export interface DateRangePickerLabels {
  /** The button that empties the period. */
  clear: string
  /** The button that keeps the days picked. */
  confirm: string
  /** Name of the trigger when it has neither `label` nor `aria-label`. */
  field: string
  /**
   * Read with the label of a required field: the control cannot say it
   * itself, so the label does.
   */
  required: string
}
```

### DateRangePickerProps

`import type { DateRangePickerProps } from "@amfernandesinc/ui"`

```ts
export interface DateRangePickerProps {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  disabled?: boolean
  /**
   * The period, controlled: ISO dates (`"yyyy-MM-dd"`), `""` for an open end.
   * Leave it out to let the picker keep its own, starting from `defaultValue`.
   */
  value?: DateRangeValue
  /** Initial period of an uncontrolled picker. */
  defaultValue?: DateRangeValue
  /** Called when the period is confirmed or cleared. */
  onValueChange?: (value: DateRangeValue) => void
  placeholder?: string
  className?: string
  numberOfMonths?: number
  /**
   * Days that cannot be picked: a preset ("past" | "future" | "weekends" |
   * "weekdays" | "today"), a Date / Date[], or a predicate. For example,
   * `disabledDays="future"` for a period that already happened.
   */
  disabledDays?: DisabledDays
  /** First day that can be picked (ISO). The calendar does not go before its month. */
  min?: string
  /** Last day that can be picked (ISO). The calendar does not go past its month. */
  max?: string
  id?: string
  /**
   * Name of the field in a native form: it sends two values, `<name>-from`
   * and `<name>-to`, with the ISO dates (`""` for an open end).
   */
  name?: string
  /**
   * Shows the period without letting it change: the trigger stays readable
   * and focusable, the calendar does not open, and the period is submitted
   * with the form. For a view-only screen; `disabled` is for a field that
   * does not apply.
   */
  readOnly?: boolean
  /**
   * Height of the trigger: `sm` 32px, `md` 40px, `lg` 44px, the same as a
   * button or input of that size.
   * @default "md"
   */
  size?: ControlSize
  /**
   * Called when the focus leaves the picker as a whole. Moving into the open
   * calendar and its buttons does not count.
   */
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void
  /** Texts of the picker. Defaults in `defaultDateRangePickerLabels`. */
  labels?: Partial<DateRangePickerLabels>
  "aria-label"?: string
  ref?: React.Ref<HTMLButtonElement>
}
```

### DateRangeValue

`import type { DateRangeValue } from "@amfernandesinc/ui"`

```ts
export interface DateRangeValue {
  from: string
  to: string
}
```

## `forms/select` — `@amfernandesinc/ui/select`

### Select

`import { Select } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/select"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `options` | `Array<SelectOption \| SelectGroup>` | **obrigatória** | Options, or groups of options with a heading. Up to about 15: past that, use Combobox. |
| `value` | `string` | — | Chosen value; `""` shows the placeholder. |
| `defaultValue` | `string` | `""` | — |
| `onValueChange` | `(value: string) => void` | — | — |
| `placeholder` | `string` | — | Shown while nothing is chosen. Overrides `labels.placeholder`. |
| `labels` | `Partial<SelectLabels>` | — | — |
| `label` | `React.ReactNode` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `required` | `boolean` | — | — |
| `disabled` | `boolean` | — | — |
| `readOnly` | `boolean` | `false` | The value shows and can be copied, but the list does not open. |
| `size` | `ControlSize` | `"md"` | Height of the trigger, the same as an Input of that size. |
| `name` | `string` | — | Field name: a native `<select>` carries the value in `FormData`. |
| `form` | `string` | — | Id of a `<form>` elsewhere in the page that the value belongs to. |
| `id` | `string` | — | — |
| `aria-label` | `string` | — | Name for a select with no visible `label`. |
| `aria-describedby` | `string` | — | — |
| `open` | `boolean` | — | — |
| `defaultOpen` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `className` | `string` | — | Class of the trigger. |
| `wrapperClassName` | `string` | — | Class of the field (label, trigger, description, error). |
| `contentClassName` | `string` | — | Class of the list. |
| `onBlur` | `React.FocusEventHandler<HTMLButtonElement>` | — | — |
| `ref` | `React.Ref<HTMLButtonElement>` | — | The trigger button. |

### defaultSelectLabels

`import { defaultSelectLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/select"`

```ts
const defaultSelectLabels: SelectLabels = {
  placeholder: "Selecione…",
}
```

### SelectGroup

`import type { SelectGroup } from "@amfernandesinc/ui"`

```ts
export interface SelectGroup {
  label: string
  options: SelectOption[]
}
```

### SelectLabels

`import type { SelectLabels } from "@amfernandesinc/ui"`

```ts
export interface SelectLabels {
  /** Shown in the trigger while nothing is chosen. */
  placeholder: string
}
```

### SelectOption

`import type { SelectOption } from "@amfernandesinc/ui"`

```ts
export interface SelectOption {
  /** Sent in forms and to `onValueChange`. Not empty: "" means no choice. */
  value: string
  label: string
  disabled?: boolean
}
```

### SelectProps

`import type { SelectProps } from "@amfernandesinc/ui"`

```ts
export interface SelectProps {
  /** Options, or groups of options with a heading. Up to about 15: past that, use Combobox. */
  options: Array<SelectOption | SelectGroup>
  /** Chosen value; `""` shows the placeholder. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Shown while nothing is chosen. Overrides `labels.placeholder`. */
  placeholder?: string
  labels?: Partial<SelectLabels>
  label?: React.ReactNode
  labelPosition?: LabelPosition
  description?: React.ReactNode
  error?: string
  required?: boolean
  disabled?: boolean
  /** The value shows and can be copied, but the list does not open. */
  readOnly?: boolean
  /** Height of the trigger, the same as an Input of that size. @default "md" */
  size?: ControlSize
  /** Field name: a native `<select>` carries the value in `FormData`. */
  name?: string
  /** Id of a `<form>` elsewhere in the page that the value belongs to. */
  form?: string
  id?: string
  /** Name for a select with no visible `label`. */
  "aria-label"?: string
  "aria-describedby"?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Class of the trigger. */
  className?: string
  /** Class of the field (label, trigger, description, error). */
  wrapperClassName?: string
  /** Class of the list. */
  contentClassName?: string
  onBlur?: React.FocusEventHandler<HTMLButtonElement>
  /** The trigger button. */
  ref?: React.Ref<HTMLButtonElement>
}
```

## `forms/time-picker` — `@amfernandesinc/ui/time-picker`

### TimePicker

`import { TimePicker } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/time-picker"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `value` | `string` | — | The time as `"HH:MM"`, or `""` while it is incomplete. |
| `defaultValue` | `string` | — | Initial time (`"HH:MM"`) of an uncontrolled picker, used without `value`. |
| `onValueChange` | `(value: string) => void` | — | Called with `"HH:MM"` once both fields hold a valid time, and with `""` otherwise. |
| `onChange` | `(value: string) => void` | — | — |
| `disabled` | `boolean` | — | — |
| `id` | `string` | — | — |
| `className` | `string` | — | — |
| `aria-label` | `string` | — | — |
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `required` | `boolean` | — | — |
| `size` | `ControlSize` | `"md"` | Height of the box: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or input of that size. |
| `readOnly` | `boolean` | `false` | Shows the time without letting it be edited: the fields stay readable, take focus and are submitted with the form, but typing, the arrows and paste change nothing. For a view-only screen; `disabled` is for a field that does not apply. |
| `onBlur` | `(event: React.FocusEvent<HTMLElement>) => void` | — | Called when the focus leaves the picker as a whole, after the field left was completed or cleared. Moving between the hour and the minutes does not count. |
| `name` | `string` | — | Name of the field in a native form. A hidden input sends `"HH:MM"`, or `""` while the time is incomplete; the two visible fields have no name. |
| `labels` | `Partial<TimePickerLabels>` | — | Texts of the picker. Defaults in `defaultTimePickerLabels`. |
| `ref` | `React.Ref<HTMLInputElement>` | — | Forwarded to the hour input. |

### defaultTimePickerLabels

`import { defaultTimePickerLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/time-picker"`

```ts
const defaultTimePickerLabels: TimePickerLabels = {
  hours: "Horas",
  minutes: "Minutos",
  group: "Horário",
  required: "obrigatório",
}
```

### TimePickerLabels

`import type { TimePickerLabels } from "@amfernandesinc/ui"`

```ts
export interface TimePickerLabels {
  /** Accessible name of the hour field. */
  hours: string
  /** Accessible name of the minute field. */
  minutes: string
  /** Name of the group when it has neither a text `label` nor `aria-label`. */
  group: string
  /**
   * Read with the label of a required field: the control cannot say it
   * itself, so the label does.
   */
  required: string
}
```

### TimePickerProps

`import type { TimePickerProps } from "@amfernandesinc/ui"`

```ts
export interface TimePickerProps {
  /** The time as `"HH:MM"`, or `""` while it is incomplete. */
  value?: string
  /** Initial time (`"HH:MM"`) of an uncontrolled picker, used without `value`. */
  defaultValue?: string
  /** Called with `"HH:MM"` once both fields hold a valid time, and with `""` otherwise. */
  onValueChange?: (value: string) => void
  /** @deprecated Use `onValueChange`; it receives the same value. */
  onChange?: (value: string) => void
  disabled?: boolean
  id?: string
  className?: string
  "aria-label"?: string
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  /**
   * Height of the box: `sm` 32px, `md` 40px, `lg` 44px, the same as a button
   * or input of that size.
   * @default "md"
   */
  size?: ControlSize
  /**
   * Shows the time without letting it be edited: the fields stay readable,
   * take focus and are submitted with the form, but typing, the arrows and
   * paste change nothing. For a view-only screen; `disabled` is for a field
   * that does not apply.
   */
  readOnly?: boolean
  /**
   * Called when the focus leaves the picker as a whole, after the field left
   * was completed or cleared. Moving between the hour and the minutes does
   * not count.
   */
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void
  /**
   * Name of the field in a native form. A hidden input sends `"HH:MM"`, or
   * `""` while the time is incomplete; the two visible fields have no name.
   */
  name?: string
  /** Texts of the picker. Defaults in `defaultTimePickerLabels`. */
  labels?: Partial<TimePickerLabels>
  /** Forwarded to the hour input. */
  ref?: React.Ref<HTMLInputElement>
}
```
