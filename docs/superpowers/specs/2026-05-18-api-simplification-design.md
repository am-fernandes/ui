# `@am-fernandes/ui` — API Simplification Design

**Status:** Approved — ready for implementation plan
**Date:** 2026-05-18
**Revision:** v2 (after rigorous review)
**Scope:** API redesign for consistency & predictability across the public surface (~145 → ~47 exports)

## Context

This library has never been published to npm — there are zero consumers. The current API was ported from shadcn/ui's compound-component pattern. With no migration cost, the only question is: **what is the right API to publish?**

This spec answers that.

## Guiding Principles

1. **Predictability over flexibility** — same patterns everywhere
2. **Data-driven where it fits** — items as arrays for navigation, options, etc.
3. **Single export per component** — except where a single compound primitive is objectively superior (`Button.asChild`, `Field` + `FieldGroup`)
4. **Props for the common case, slots for the variant** — `label`/`error`/`description` everywhere; `ReactNode` slots (`footer`, `headerAction`, `action`, `trigger`) for the cases that don't fit
5. **Children = body** for overlays and cards
6. **`ReactNode` over `string`** for any user-facing content prop — keeps the door open for rich content without API churn
7. **A11y is the library's job** — labels, ARIA wiring, focus management handled internally so consumers can't get it wrong
8. **No premature flexibility** — resist slot creep until the use case shows up 3+ times

## Trade-off summary

What we GAIN:
- One mental model: `label`/`description`/`error` on every control, `title`/`description`/`children` on every overlay, `items`/`groups` on every navigation
- Zero a11y footguns (impossible to render Dialog without title, impossible to forget `htmlFor` on Label)
- ~67% smaller public API surface
- Type-safe item shapes for navigation/options
- Internal refactors don't break consumers

What we LOSE:
- Compound flexibility for edge cases (mitigated via `ReactNode` slots)
- Direct shadcn migration path (irrelevant — no users)

What we PRESERVE:
- `Button.asChild` (the only Radix-style compound that's objectively the right pattern, for router Link integration)
- `Field` + `FieldGroup` as the two-export form layout primitive (legible split)
- `Form` + `FormField` as the two-export RHF wrapper

---

# Primitive Components

## `Avatar`

```tsx
<Avatar
  src="https://github.com/shadcn.png"
  alt="@shadcn"
  fallback="CN"        // string OR ReactNode (e.g. <UserIcon/>)
  className=""
/>
```

| Prop | Type | Notes |
|---|---|---|
| `src` | `string` | Image URL |
| `alt` | `string` | Required (a11y) |
| `fallback` | `ReactNode` | Shown when no `src` or on error. Initials or icon. |
| `className` | `string` | Tailwind classes for root |

**Internal:** Renders `AvatarPrimitive.Root` + `AvatarImage` + `AvatarFallback` based on props. If `src` present, renders image; on error or absence, renders fallback.

**Out of scope:** online-status dot (consumer wraps `<Avatar/>` in a `<div className="relative">` with the dot positioned absolutely).

---

## `Badge`

**Unchanged from current.** Already flat with `variant` prop.

```tsx
<Badge variant="default | secondary | destructive | outline | success | warning | info" className="">
  Conteúdo
</Badge>
```

**Not added:** `icon`/`dot`/`closable` — wait for real demand before slot creep.

---

## `Button`

**Compound primitive — keep `asChild`. This is the only Radix-style compound retained.**

```tsx
<Button
  variant="default | destructive | outline | secondary | ghost | link"
  size="default | sm | lg | icon"
  loading={isLoading}        // NEW — spinner + auto-disabled
  asChild                    // KEPT — router Link integration
  onClick={fn}
>
  Salvar
</Button>

// Router integration (unchanged from current):
<Button asChild>
  <Link href="/users">Usuários</Link>
</Button>
```

| Prop | Type | Notes |
|---|---|---|
| `variant` | enum | `default \| destructive \| outline \| secondary \| ghost \| link` |
| `size` | enum | `default \| sm \| lg \| icon` (sizes `sm`/`lg` are NEW) |
| `loading` | `boolean` | When true, renders `<Loader2 className="animate-spin" />` before children and forces `disabled` |
| `asChild` | `boolean` | Radix Slot — single child receives Button styles |
| ...native button props | — | All standard `<button>` props pass through |

**Rationale for keeping `asChild`:** Router `<Link>` integration is the canonical case. Alternatives (`<Link className={buttonVariants()}>`, polymorphic `as` prop, conditional `<a>` based on `href`) all lose either `loading`/`disabled` propagation, type inference, or framework integration (prefetch).

---

## `Checkbox`

```tsx
<Checkbox
  label="Aceito os termos"
  description="Você pode revogar a qualquer momento."
  error="Campo obrigatório"
  checked={x}                // true | false | "indeterminate"
  onCheckedChange={fn}
  disabled
  required
/>
```

| Prop | Type | Notes |
|---|---|---|
| `label` | `ReactNode` | Rich label allowed: `<>Aceito os <a href="/tos">termos</a></>` |
| `description` | `ReactNode` | Helper text below label |
| `error` | `string` | Validation message (sets `aria-invalid`, renders below) |
| `checked` | `boolean \| "indeterminate"` | |
| `onCheckedChange` | `(checked) => void` | |
| `disabled` | `boolean` | |
| `required` | `boolean` | Marks label with asterisk |

**Internal:** Renders `<Label>` (internalized) bound to the checkbox via Radix's implicit-label pattern. `<MinusIcon>` for indeterminate state.

**Edge case:** Checkbox in a table without visible label — pass `aria-label` (via native prop spread). `label` is optional.

---

## `Input`

```tsx
<Input
  label="E-mail"
  labelPosition="up"         // "up" | "left" | "hidden"
  required                   // marks label + sets HTML required
  placeholder="seu@email.com"
  description="Não compartilharemos com terceiros."
  error="Formato inválido"
  leadingIcon={<MailIcon />}
  trailingIcon={<EyeIcon onClick={togglePassword} />}
  type="email"
  value={x}
  onChange={(e) => setX(e.target.value)}
/>
```

| Prop | Type | Notes |
|---|---|---|
| `label` | `ReactNode` | |
| `labelPosition` | `"up" \| "left" \| "hidden"` | `"hidden"` = sr-only label (a11y without visual) |
| `required` | `boolean` | Asterisk on label + HTML `required` |
| `description` | `ReactNode` | |
| `error` | `string` | |
| `leadingIcon` | `ReactNode` | Rendered inside input wrapper, left |
| `trailingIcon` | `ReactNode` | Rendered inside input wrapper, right (clickable) |
| ...native input props | — | `type`, `value`, `onChange`, `placeholder`, `disabled`, `readOnly`, `min`, `max`, etc. |

**Internal:** Wraps `<input>` in a `Field`-like flex container. `error` sets `aria-invalid` and `aria-describedby`.

**Edge case:** Input embedded in a custom layout where label is rendered externally — pass `labelPosition="hidden"` with `aria-label` via native prop.

---

## `Textarea`

```tsx
<Textarea
  label="Descrição"
  description="Mínimo 10 caracteres"
  error={errors.description?.message}
  autoResize                 // NEW — grows with content
  maxLength={500}            // shows counter "n/500" when set
  value={x}
  onChange={(e) => setX(e.target.value)}
/>
```

Same `label`/`description`/`error`/`labelPosition`/`required` API as Input.

| Prop | Type | Notes |
|---|---|---|
| `autoResize` | `boolean` | Grows height to content (no fixed `rows`) |
| `maxLength` | `number` | When set, renders counter below |

No `leadingIcon`/`trailingIcon` — doesn't make sense for textarea.

---

## `RadioGroup`

```tsx
<RadioGroup
  label="Plano"
  description="Você pode mudar a qualquer momento."
  error={errors.plan?.message}
  orientation="vertical"      // "vertical" | "horizontal"
  values={[
    {
      value: "free",
      label: "Free",
      description: "Para começar",
      icon: ZapIcon,
      disabled: false,
    },
    { value: "pro", label: "Pro", description: "R$ 29/mês" },
    { value: "team", label: "Team", description: "R$ 99/mês", disabled: true },
  ]}
  defaultValue="free"
  value={plan}
  onValueChange={setPlan}
/>
```

| RadioGroup prop | Type |
|---|---|
| `label` | `ReactNode` |
| `description` | `ReactNode` |
| `error` | `string` |
| `orientation` | `"vertical" \| "horizontal"` |
| `values` | `RadioGroupItemData[]` |
| `value`/`defaultValue`/`onValueChange` | RHF-compatible |
| `disabled` | `boolean` (disables all items) |
| `required` | `boolean` |

| `RadioGroupItemData` | Type |
|---|---|
| `value` | `string` |
| `label` | `ReactNode` |
| `description` | `ReactNode` (NEW — for plan cards etc.) |
| `icon` | `ComponentType<{ className?: string }>` (NEW) |
| `disabled` | `boolean` |

**Internal:** Maps `values` to `RadioGroupItem` + `<Label htmlFor>` pairs. Each item gets a stable `id` derived from value.

---

## `Switch`

```tsx
<Switch
  label="Notificações push"
  description="Você ainda receberá alertas críticos."
  labelPosition="right"       // "left" | "right" (default "right")
  checked={enabled}
  onCheckedChange={setEnabled}
/>
```

Same API as Checkbox minus the `indeterminate` state.

---

## `Label`

**REMOVED from public exports.** Internalized — used by Input/Textarea/Checkbox/Switch/RadioGroup/Combobox/etc. via their `label` prop.

---

## `Separator`

```tsx
<Separator orientation="horizontal" decorative />
<Separator label="ou" />     // NEW — renders "—— ou ——"
```

| Prop | Type | Notes |
|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | |
| `decorative` | `boolean` | When true, removes from a11y tree (default `true`) |
| `label` | `ReactNode` | When set, renders text in the middle of the line |

---

## `Skeleton`

**Unchanged.** Already a single component with `className`. Defaults `role="status"`, `aria-busy="true"`, `aria-live="polite"`.

---

## `Typography`

**Unchanged.** Already props-driven with `variant` + `as`. `as` restricted to curated union.

---

# Overlay Components

## `Alert`

```tsx
<Alert
  variant="default | success | warning | destructive | info"
  title="Atualização disponível"
  description="A versão 2.0 está pronta."
  icon={<DownloadIcon />}           // optional, overrides variant default
  action={<Button size="sm">Atualizar</Button>}   // NEW — CTA right
/>

// Or with children for complex body:
<Alert variant="info" title="Aviso">
  <p>Conteúdo customizado mais complexo aqui.</p>
</Alert>
```

| Prop | Type |
|---|---|
| `variant` | enum |
| `title` | `ReactNode` |
| `description` | `ReactNode` |
| `icon` | `ReactNode` (override variant default) |
| `action` | `ReactNode` (NEW — renders right-aligned in desktop, below in mobile) |
| `children` | `ReactNode` (alternative to `description` for rich body) |

No sub-exports.

---

## `AlertDialog`

```tsx
<AlertDialog
  trigger={<Button variant="destructive">Excluir</Button>}
  title="Tem certeza?"
  description="Esta ação não pode ser desfeita."
  onConfirm={handleDelete}
  confirmLabel="Excluir"
  confirmVariant="destructive"
  cancelLabel="Cancelar"
  open={open}
  onOpenChange={setOpen}
>
  {/* optional extra body content above buttons */}
  <Textarea label="Motivo (opcional)" value={reason} onChange={setReason} />
</AlertDialog>
```

| Prop | Type |
|---|---|
| `trigger` | `ReactNode` (skip for fully controlled) |
| `title` | `ReactNode` (required) |
| `description` | `ReactNode` |
| `onConfirm` | `() => void` |
| `confirmLabel` | `string` (default `"Confirmar"`) |
| `confirmVariant` | `ButtonVariant` (default matches `variant`) |
| `cancelLabel` | `string` (default `"Cancelar"`) |
| `onCancel` | `() => void` (optional) |
| `open`/`onOpenChange` | Controlled state |
| `children` | `ReactNode` — extra body above the buttons |

No sub-exports.

---

## `Collapsible`

```tsx
<Collapsible
  title="Configurações avançadas"          // default trigger renders this + chevron
  triggerSide="right"                       // "left" | "right" (chevron position)
  defaultOpen={false}
  open={open}
  onOpenChange={setOpen}
>
  <Settings />
</Collapsible>

// Custom trigger (replaces the default button):
<Collapsible trigger={<CardHeader>{...}</CardHeader>} open={x} onOpenChange={fn}>
  {body}
</Collapsible>
```

| Prop | Type |
|---|---|
| `title` | `ReactNode` (used by default trigger) |
| `trigger` | `ReactNode` (NEW — replaces default button; mutually exclusive with `title`) |
| `triggerSide` | `"left" \| "right"` (chevron position when using default trigger) |
| `defaultOpen` | `boolean` |
| `open`/`onOpenChange` | Controlled |
| `children` | `ReactNode` — body |

No sub-exports.

---

## `Dialog`

```tsx
<Dialog
  trigger={<Button>Editar</Button>}
  title="Editar perfil"
  description="Atualize suas informações."
  open={open}
  onOpenChange={setOpen}
  hideCloseButton={false}
  closeLabel="Close"
  footer={
    <>
      <Button variant="outline" onClick={onCancel}>Cancelar</Button>
      <Button onClick={onSave}>Salvar</Button>
    </>
  }
>
  <form>{fields}</form>
</Dialog>
```

| Prop | Type |
|---|---|
| `trigger` | `ReactNode` (skip for controlled-only) |
| `title` | `ReactNode` (required, may be `sr-only` via className) |
| `description` | `ReactNode` |
| `open`/`onOpenChange` | Controlled |
| `hideCloseButton` | `boolean` (default `false`) |
| `closeLabel` | `string` (default `"Close"`) |
| `footer` | `ReactNode` (NEW — renders flex-end gap-2 in footer slot) |
| `children` | `ReactNode` — body |

No sub-exports.

---

## `Popover`

```tsx
<Popover
  trigger={<Button>Filtrar</Button>}
  align="start"
  sideOffset={4}
  open={open}
  onOpenChange={setOpen}
>
  <FilterForm />
</Popover>
```

| Prop | Type |
|---|---|
| `trigger` | `ReactNode` |
| `align` | `"start" \| "center" \| "end"` |
| `side` | `"top" \| "right" \| "bottom" \| "left"` |
| `sideOffset` | `number` |
| `open`/`onOpenChange` | Controlled |
| `children` | `ReactNode` — content |

No `PopoverAnchor` export. Rare edge case (anchor different from trigger) requires direct Radix usage.

---

## `Progress`

**Unchanged.** `<Progress value={n} max={100} />` with clamping and indeterminate animation.

---

## `Sheet`

```tsx
<Sheet
  trigger={<Button>Abrir</Button>}
  title="Configurações"
  description="Ajuste suas preferências"
  side="right"                // "top" | "bottom" | "left" | "right"
  open={open}
  onOpenChange={setOpen}
  footer={<Button>Salvar</Button>}
>
  {body}
</Sheet>
```

Same API as Dialog plus `side`. Same `footer` slot.

No sub-exports.

---

## `Toaster` + `toast`

**Unchanged.** `<Toaster />` mounted once at app root, `toast.success/error/info/warning/loading/promise(...)` from anywhere.

---

## `Tooltip`

```tsx
<Tooltip content="Texto de ajuda" delayDuration={200} side="top">
  <Button><InfoIcon /></Button>
</Tooltip>
```

| Prop | Type |
|---|---|
| `content` | `ReactNode` |
| `delayDuration` | `number` |
| `side`/`align`/`sideOffset` | positioning |
| `children` | trigger element |

`TooltipProvider` is internalized — `Tooltip` mounts its own provider OR detects an outer one.

No sub-exports.

---

# Form Components

## `Field` + `FieldGroup`

```tsx
// Single field — wraps any control
<Field
  label="Nome"
  description="Conforme RG"
  error={errors.name?.message}
  orientation="vertical"        // "vertical" | "horizontal" | "responsive"
  required
  disabled
>
  <Input value={name} onChange={(e) => setName(e.target.value)} />
</Field>

// Group with legend
<FieldGroup legend="Dados pessoais" description="Preencha todos os campos">
  <Field label="Nome" error={...}><Input ... /></Field>
  <Field label="CPF" error={...}><Input ... /></Field>
</FieldGroup>
```

11 exports → 2 (`Field`, `FieldGroup`). `FieldLabel`, `FieldDescription`, `FieldError`, `FieldSeparator`, `FieldSet`, `FieldLegend`, `FieldTitle`, `FieldContent` internalized.

**When to use:** `Field` is for **non-`@am-fernandes/ui` controls** or for layout when you want consistent label/error rendering around a custom control. The library's own inputs (`Input`, `Combobox`, `DateInput`, `CurrencyInput`, etc.) already accept `label`/`description`/`error` directly — wrapping them in `Field` would double-render labels.

---

## `Form` + `FormField`

```tsx
<Form
  resolver={zodResolver(schema)}      // RHF resolver — Zod/Yup/Valibot/Joi all work
  defaultValues={{ email: "" }}
  onSubmit={async (data) => { ... }}
  className="space-y-4"
>
  {/* Built-in HTML input via `type` shortcut */}
  <FormField name="email" type="email" label="E-mail" />
  <FormField name="password" type="password" label="Senha" />

  {/* Custom control via render prop */}
  <FormField name="city" label="Cidade">
    {(field) => <Combobox {...field} options={cities} />}
  </FormField>

  <Button type="submit" loading={isPending}>Salvar</Button>
</Form>
```

| `Form` prop | Type |
|---|---|
| `resolver` | RHF `Resolver<T>` |
| `defaultValues` | RHF defaults |
| `onSubmit` | RHF submit handler |
| `mode` | RHF validation mode |
| `className` | for `<form>` element |
| `children` | form body |

| `FormField` prop | Type |
|---|---|
| `name` | path in `T` |
| `label` | `ReactNode` |
| `description` | `ReactNode` |
| `type` | HTML input type shortcut: `"text" \| "email" \| "password" \| "number" \| "tel" \| "url" \| "search" \| "date" \| "time" \| "checkbox" \| "switch" \| "textarea"` |
| `children` | `(field: ControllerRenderProps) => ReactNode` — render prop for custom controls |
| `placeholder` | when `type` shortcut is used |
| ...native control props | passthrough |

**Rationale for `resolver` over `schema`:** Schema-lib agnostic. Consumer imports `zodResolver` (or yup/valibot/joi adapter) one time. Avoids forcing Zod on the library.

`FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField` are internalized. The `useForm` hook is re-exported from RHF for advanced cases.

---

## `Combobox`

```tsx
<Combobox
  label="Cidade"
  description="Escolha sua cidade natal"
  error={errors.city?.message}
  placeholder="Selecione..."
  searchPlaceholder="Buscar..."
  emptyMessage="Nenhuma cidade encontrada."
  options={cities}                    // ComboboxOption[]
  value={selected}
  onValueChange={setSelected}
  multiple={false}
  creatable={false}
  onCreate={(value) => { ... }}       // when creatable
  disabled
/>
```

Already props-driven. Adds `label`/`description`/`error` for consistency.

`useComboboxOptions` helper retained as standalone export.

---

## `Calendar`

```tsx
<Calendar
  mode="single"               // "single" | "range" | "multiple"
  selected={date}
  onSelect={setDate}
  locale={ptBR}
  disabledDays={[new Date()]}
  numberOfMonths={1}
/>
```

`CalendarDayButton` internalized.

---

## `DateInput`

```tsx
<DateInput
  label="Data de nascimento"
  description="Conforme documento"
  error={errors.dob?.message}
  value="1990-01-15"          // ISO YYYY-MM-DD (local time interpretation)
  onChange={(value) => setDob(value)}
  placeholder="dd/mm/aaaa"
  locale={ptBR}
  disabled
/>
```

---

## `DateRangePicker`

```tsx
<DateRangePicker
  label="Período"
  description="Selecione data inicial e final"
  error={errors.period?.message}
  value={{ from: "2025-01-01", to: "2025-01-31" }}
  onChange={(range) => setPeriod(range)}
  numberOfMonths={2}
  locale={ptBR}
  disabled
/>
```

Split-prop API (`from`/`to`/`onFromChange`/`onToChange`) removed in favor of object API.

---

## `TimePicker`

```tsx
<TimePicker
  label="Horário"
  description="Formato 24h"
  error={errors.time?.message}
  value="14:30"
  onChange={(value) => setTime(value)}
  disabled
/>
```

---

# Navigation Components

## `Accordion`

```tsx
<Accordion
  type="single"               // "single" | "multiple"
  collapsible
  defaultValue="item1"
  value={open}
  onValueChange={setOpen}
  items={[
    {
      value: "item1",
      title: "Seção 1",
      content: <p>...</p>,
      action: <Button size="sm" variant="ghost"><EditIcon /></Button>,
      disabled: false,
    },
    { value: "item2", title: "Seção 2", content: <p>...</p> },
  ]}
/>
```

`AccordionItemData` type:
```ts
interface AccordionItemData {
  value: string
  title: ReactNode
  content: ReactNode
  action?: ReactNode    // NEW — renders right side of header (delete/edit etc.)
  disabled?: boolean
}
```

Single export (`Accordion`). `AccordionItemData` type exported.

---

## `Breadcrumb`

```tsx
<Breadcrumb
  ariaLabel="Breadcrumb"
  separator={<ChevronRight />}      // optional
  maxItems={3}                       // NEW — collapses middle items into "..."
  items={[
    { label: "Home", href: "/" },
    { label: "Usuários", href: "/users" },
    { label: "Editar" },                // last item, no href → current page
  ]}
/>
```

`BreadcrumbItemData`:
```ts
interface BreadcrumbItemData {
  label: ReactNode
  href?: string
  isCurrentPage?: boolean   // explicit override for "current" (otherwise inferred from last + no href)
}
```

Single export. Type exported.

---

## `CommandPalette` (renamed from `Command`)

```tsx
<CommandPalette
  open={open}
  onOpenChange={setOpen}
  placeholder="Buscar comandos..."
  value={query}                       // controlled input value (for server-side filter)
  onValueChange={setQuery}
  loading={isLoading}
  emptyMessage="Nenhum resultado"
  title="Paleta de comandos"          // sr-only DialogTitle (a11y required by Radix)
  description="Busque e execute"      // sr-only DialogDescription
  groups={[
    {
      heading: "Navegação",
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          shortcut: "⌘D",
          onSelect: () => navigate("/"),
        },
        {
          label: "Perfil",
          icon: User,
          shortcut: "⌘P",
          onSelect: () => navigate("/profile"),
        },
      ],
    },
    {
      heading: "Ações",
      items: [
        {
          label: "Exportar dados",
          icon: Download,
          onSelect: handleExport,
          disabled: !canExport,
        },
        {
          // Custom render replaces label+icon completely
          render: <UserMentionRow user={user} />,
          onSelect: () => openUser(user.id),
        },
      ],
    },
  ]}
/>
```

| `CommandPaletteItem` | Type |
|---|---|
| `label` | `string` (unless `render`) |
| `icon` | `ComponentType<{ className?: string }>` |
| `shortcut` | `string` (e.g. `"⌘K"`) |
| `onSelect` | `() => void` |
| `disabled` | `boolean` |
| `render` | `ReactNode` (overrides label/icon for custom row) |
| `keywords` | `string[]` (extra search tokens) |

All `Command`/`CommandDialog`/`CommandEmpty`/`CommandGroup`/`CommandInput`/`CommandItem`/`CommandList`/`CommandSeparator`/`CommandShortcut` internalized.

---

## `Sidebar`

```tsx
<Sidebar
  // Structure (use `items` for flat, `groups` for grouped)
  groups={[
    {
      label: "Geral",
      items: [
        { id: "dash", label: "Dashboard", icon: LayoutDashboard, href: "/" },
        { id: "users", label: "Usuários", icon: Users, href: "/users", badge: <Badge>12</Badge> },
      ],
    },
    {
      label: "Relatórios",
      items: [
        {
          id: "rpt",
          label: "Relatórios",
          icon: BarChart3,
          items: [
            { id: "fin", label: "Financeiro", href: "/reports/fin" },
            { id: "ops", label: "Operacional", href: "/reports/ops" },
          ],
        },
      ],
    },
  ]}
  // OR simpler — flat items
  // items={[...]}

  // Active state — router-agnostic
  isActive={(item) => router.pathname === item.href}

  // Slots
  header={<div className="p-4"><Logo /></div>}
  footer={<UserMenu />}

  // Behavior
  collapsible="icon"          // "offcanvas" | "icon" | "none"
  side="left"
  variant="sidebar"           // "sidebar" | "floating" | "inset"
  defaultOpen={true}
  open={open}
  onOpenChange={setOpen}
  persistOpenState={false}    // opt-in cookie persistence (GDPR/LGPD)
  keyboardShortcut="b"        // null to disable
/>
```

`SidebarItem`:
```ts
interface SidebarItem {
  id?: string                          // optional — falls back to label hash
  label: ReactNode
  icon?: ComponentType<{ className?: string }>
  href?: string                        // if set, renders <a>; else <button>
  onClick?: () => void
  badge?: ReactNode                    // notification count, status pill, etc.
  disabled?: boolean
  items?: SidebarItem[]                // submenu (one level deep recommended)
  tooltip?: ReactNode                  // only shown when collapsible="icon" and collapsed
}

interface SidebarGroup {
  label?: ReactNode                    // group heading
  items: SidebarItem[]
}
```

All 23 current sub-components (`SidebarProvider`, `SidebarContent`, `SidebarMenuButton`, etc.) internalized. `useSidebar` hook **also internalized** — `Sidebar` manages its own state via the `open`/`onOpenChange` props.

**Out of scope for v10:** drag-and-drop reorder, search at the top of the menu (header can hold custom content but submenu search is a separate feature).

---

## `Tabs`

```tsx
<Tabs
  items={[
    {
      value: "msg",
      label: "Mensagens",
      badge: <Badge>3</Badge>,        // NEW — notification on trigger
      content: <Inbox />,
      disabled: false,
    },
    { value: "set", label: "Configurações", content: <Settings /> },
  ]}
  defaultValue="msg"
  value={tab}
  onValueChange={setTab}
  orientation="horizontal"            // "horizontal" | "vertical"
  lazy={false}                        // NEW — when true, inactive panels don't mount
/>
```

`TabsItemData`:
```ts
interface TabsItemData {
  value: string
  label: ReactNode
  badge?: ReactNode      // NEW
  content: ReactNode
  disabled?: boolean
}
```

Single export. Type exported.

---

# Data Components

## `Card`

```tsx
<Card
  title="Vendas"
  description="Últimos 30 dias"
  headerAction={<Badge variant="success">+12%</Badge>}    // NEW — right-aligned in header
  footer={<Button>Ver detalhes</Button>}
>
  <Chart ... />
</Card>

// Pure container (no header/footer):
<Card>{anything}</Card>
```

| Prop | Type | Notes |
|---|---|---|
| `title` | `ReactNode` | When set, renders header |
| `description` | `ReactNode` | |
| `headerAction` | `ReactNode` (NEW) | Right side of header (badge, icon button, etc.) |
| `footer` | `ReactNode` | Bottom flex-end |
| `children` | `ReactNode` | Body |

`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter` internalized.

**Resist slot creep:** do NOT add `headerLeading`/`headerOverline`/`headerTag` until 3+ real cases demand it.

---

## `Chart`

Kept compound because Recharts itself is compositional. Reduced surface:

```tsx
<ChartContainer config={config} className="h-[300px]">
  <LineChart data={data}>
    <ChartTooltip indicator="dot" />
    <ChartLegend />
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" />
    <YAxis />
    <Line dataKey="revenue" stroke="var(--color-revenue)" />
  </LineChart>
</ChartContainer>
```

| Export | Purpose |
|---|---|
| `ChartContainer` | Wrapper providing config + theme |
| `ChartTooltip` | Drop-in tooltip (merges what was `ChartTooltip` + `ChartTooltipContent`) |
| `ChartLegend` | Drop-in legend (merges what was `ChartLegend` + `ChartLegendContent`) |
| `ChartStyle` | Internal CSS variable injector — exported only because `ChartContainer` mounts it |
| `type ChartConfig` | Config type |

`ChartTooltipContent` and `ChartLegendContent` merged into their parents (internal — no separate exports).

---

## `DataTable`

```tsx
<DataTable
  columns={columns}
  data={users}
  searchableColumns={["name", "email"]}
  searchPlaceholder="Buscar..."
  emptyMessage="Nenhum registro."
  pagination={{ pageSize: 10 }}
  showRowCount
  // Controlled state (v10 addition)
  sorting={sorting}
  onSortingChange={setSorting}
  globalFilter={query}
  onGlobalFilterChange={setQuery}
  pageIndex={page}
  onPaginationChange={setPagination}
  pageCount={totalPages}
  manualPagination
  labels={{
    search: "Pesquisar",
    empty: "Sem dados",
    rowCount: (filtered, total) => `${filtered} de ${total}`,
  }}
/>
```

Already props-driven. v10 controlled-state props remain.

All `Table*` primitives internalized.

---

## `Image`

```tsx
<Image
  src="/foto.jpg"
  alt="Descrição"
  aspectRatio={16/9}
  objectFit="cover"             // "cover" | "contain" | "fill" | "none" | "scale-down"
  rounded="md"                   // "none" | "sm" | "md" | "lg" | "full"
  placeholder="skeleton"         // "skeleton" | "blur" | "none"
  loading="lazy"
  srcSet={...}                   // KEPT — responsive images
  sizes={...}                    // KEPT
  decorative={false}             // KEPT — when true, alt="" + role="presentation"
  allowedProtocols={["http:", "https:"]}    // KEPT — security
  onLoad={fn}
  onError={fn}
/>
```

All current v10 props retained. They're small additions that solve real problems — not removing.

---

## `ScrollArea`

**Unchanged.** Single component with `orientation: "vertical" | "horizontal" | "both"`. `ScrollBar` internalized.

---

## `Tree`

```tsx
<Tree
  data={[
    {
      id: "1",
      label: "Pasta",
      icon: Folder,
      children: [{ id: "2", label: "arquivo.pdf", icon: File }],
    },
  ]}
  defaultExpanded={["1"]}
  expanded={expandedSet}
  onExpandedChange={setExpandedSet}
  selected={selectedId}
  onSelectedChange={setSelectedId}
  maxDepth={64}
  indentSize={16}
/>
```

Already data-driven. v10 WAI-ARIA tree pattern (roving tabindex, arrow keys, Home/End) retained.

---

## `Video`

```tsx
<Video
  src="/video.mp4"
  aria-label="Vídeo explicativo"
  poster="/thumb.jpg"
  captions={[
    { src: "/legenda.vtt", srcLang: "pt", label: "Português", kind: "captions", default: true },
  ]}
  aspectRatio={16/9}
  autoPlay={false}
  controls
  loop={false}
  preload="metadata"
  allowedProtocols={["http:", "https:"]}    // KEPT
/>
```

Already single component. v10 protections retained.

---

# Domain Components

## `CurrencyInput`

```tsx
<CurrencyInput
  label="Valor"
  description="Em reais"
  error={errors.value?.message}
  value={150.50}                    // float reais — see lib/currency for cents helpers
  onValueChange={setValor}
  disabled={isSubmitting}
/>
```

---

## `FileUpload`

```tsx
<FileUpload
  label="Comprovante"
  description="PDF ou imagem, até 5MB"
  error={errors.file?.message}
  accept="image/*,.pdf"
  maxSize={mb(5)}
  maxFiles={3}
  multiple
  preview="thumbnail"
  camera={false}
  value={files}
  onValueChange={setFiles}
  onReject={(rejections) => { ... }}
  disabled
/>
```

---

## `InputOTP`

```tsx
<InputOTP
  label="Código SMS"
  description="Verifique seu celular"
  error={errors.code?.message}
  length={6}
  separatorEvery={3}                // NEW shortcut — places separator every N slots
  separator="-"                      // NEW — separator content
  pattern={REGEXP_ONLY_DIGITS}      // default (re-exported from lib)
  value={code}
  onValueChange={setCode}
  onComplete={onComplete}
  disabled
/>
```

`InputOTPGroup`/`InputOTPSlot`/`InputOTPSeparator` internalized. `REGEXP_ONLY_DIGITS` re-exported.

---

## `MultiInput`

```tsx
<MultiInput
  type="string"                     // "string" | "number"
  label="Tags"
  description="Adicione tags separadas por vírgula"
  error={errors.tags?.message}
  value={tags}
  onValueChange={setTags}
  maxItems={10}
  onReject={(reason) => { ... }}
  placeholder="Adicione uma tag"
  disabled
/>
```

---

## `PercentageInput`

```tsx
<PercentageInput
  label="Taxa de juros"
  description="0 a 100"
  error={errors.rate?.message}
  value={12.5}
  onValueChange={setTaxa}
  max={100}
  disabled
/>
```

---

# Hooks & Lib

| Export | Status |
|---|---|
| `useIsMobile` | ✅ Maintain |
| `cn` | ✅ Maintain |
| `centsToDisplay`, `toCents`, `fromCents`, `formatBRL`, `percentFromValue`, `percentOfTotal` | ✅ Maintain |
| `bytes`, `kb`, `mb`, `gb` | ✅ Maintain |
| `REGEXP_ONLY_DIGITS` | ✅ Re-exported from `input-otp` |
| `tableStyles()` | 🆕 NEW — helper returning Tailwind classes for raw `<table>` |
| `buttonVariants()` | ✅ Maintain — already exists |

## `tableStyles()` rationale

Removing `Table` from public exports leaves a gap: static tables (plan comparison, configuration listings) shouldn't pull in `@tanstack/react-table`. `tableStyles()` returns classnames so consumers can stylize raw HTML:

```tsx
import { tableStyles } from "@am-fernandes/ui"

const t = tableStyles()
<table className={t.table}>
  <thead className={t.header}>
    <tr><th className={t.head}>Nome</th></tr>
  </thead>
  <tbody>
    <tr className={t.row}>
      <td className={t.cell}>...</td>
    </tr>
  </tbody>
</table>
```

Mirrors how `buttonVariants()` already works in the library.

---

# Export Impact

| Category | Current | Proposed | Reduction |
|---|---|---|---|
| Primitives | 13 | 9 (Avatar, Badge, Button, Checkbox, Input, RadioGroup, Separator, Skeleton, Switch, Textarea, Typography minus Label) | -31% |
| Overlays | 31 | 9 (Alert, AlertDialog, Collapsible, Dialog, Popover, Progress, Sheet, Toaster, Tooltip + `toast` fn) | -71% |
| Forms | 19 | 7 (Field, FieldGroup, Form, FormField, Combobox, Calendar + 3 date controls + TimePicker + `useComboboxOptions`) | -63% |
| Navigation | 44 | 5 (Accordion, Breadcrumb, CommandPalette, Sidebar, Tabs) | -89% |
| Data | 22 | 7 (Card, ChartContainer, ChartTooltip, ChartLegend, ChartStyle, DataTable, Image, ScrollArea, Tree, Video) | -55% |
| Domain | 8 | 5 (CurrencyInput, FileUpload, InputOTP, MultiInput, PercentageInput) | -38% |
| Hooks/Lib | 8 | 10 (+ `tableStyles`, `REGEXP_ONLY_DIGITS`) | +25% |
| **Total** | **~145** | **~52** | **~64%** |

(Exact count depends on whether you count types like `BadgeProps`, `ButtonProps`, `ComboboxOption` etc. The reduction in **component exports** is steeper.)

---

# Notable divergences from v1 of this spec

1. **`Button.asChild` retained** — only Radix-style compound kept. Router Link integration has no clean alternative.
2. **`Dialog` / `Sheet` gain `footer` prop** — almost every dialog has a footer with action buttons.
3. **`Card` gains `headerAction` prop** — the "title + right-aligned badge/button" pattern is too common to omit.
4. **`Form` uses RHF `resolver` instead of `schema`** — schema-lib agnostic (Zod/Yup/Valibot/Joi/Standard Schema all work via their RHF adapters).
5. **`FormField` adds `render` slot** — covers `Combobox`, `DateInput`, `FileUpload`, `CurrencyInput`, etc. as custom controls.
6. **`Sidebar` accepts `groups`** (with `label` headings) in addition to flat `items` — real-world menus have grouping.
7. **`Sidebar` items support `badge: ReactNode`, `items` (submenu), `tooltip`, `disabled`, `onClick`** — full coverage of the typical menu surface.
8. **`Sidebar` has `isActive: (item) => boolean` callback** — router-agnostic active state.
9. **`Tabs` items support `badge` + `lazy` prop** on root — notification + perf.
10. **`Accordion` items support `action: ReactNode`** — common "delete this section" button.
11. **`Breadcrumb` supports `maxItems`** — collapse long trails.
12. **`CommandPalette` supports `loading`, `emptyMessage`, controlled `value`/`onValueChange`, item `render` slot** — server-side search & custom rows.
13. **`Image` retains `srcSet`/`sizes`/`allowedProtocols`/`decorative`** — small, real features, not YAGNI candidates.
14. **`Checkbox` / `Switch` / `Input` / `Textarea` / `RadioGroup` accept `label: ReactNode`** (not string) — `<>Aceito os <a>termos</a></>` works.
15. **`Input` / `Textarea`** gain `description`, `error`, `required`, `leadingIcon`, `trailingIcon`, `labelPosition="hidden"` for sr-only labels.
16. **`Textarea`** gains `autoResize` and `maxLength` (with counter).
17. **`Separator`** gains `label?: ReactNode` — "—— ou ——".
18. **`Alert`** gains `action: ReactNode` — CTA on the right.
19. **`Collapsible`** gains `trigger: ReactNode` — custom trigger element.
20. **`DateRangePicker`** uses `value: { from, to } / onChange(range)` object API (split props removed).
21. **`tableStyles()` helper** exported — raw `<table>` styling for static cases without pulling `DataTable`.

---

# Out of scope (deferred for future versions)

- `ThemeProvider` for tokens / dark mode customization
- `LocaleProvider` for centralizing pt-BR/en strings
- `<IconButton>` as Button variant with required `aria-label`
- Drag-and-drop reorder for `Sidebar` / `Tree`
- Virtualization for `CommandPalette` / `DataTable`
- `useDebounce`, `useMediaQuery` hooks
- `<ZodForm>` sugar wrapper (`<Form resolver={zodResolver(schema)}>` shortcut)

---

# Release strategy

Since the library has not yet been published to npm, this is a **pre-publication API revision**, not a breaking change. The current v10.0.0 in-repo work is rolled into a single v10.0.0 release with this API.

**Implementation order** (rough):
1. Demolition: remove sub-component exports from `src/index.ts`, delete obsolete files, rename `Command` → `CommandPalette`
2. Foundational primitives (`Input`, `Textarea`, `Label` internalized, `Field`, `FieldGroup`)
3. Form controls (`Checkbox`, `Switch`, `RadioGroup`, domain inputs, date controls, `Combobox`)
4. Overlays (`Dialog`, `AlertDialog`, `Sheet`, `Popover`, `Tooltip`, `Alert`, `Collapsible`)
5. Layout primitives (`Card` flat, `Separator` with label, `Avatar` flat)
6. Navigation (`Accordion`, `Tabs`, `Breadcrumb`, `CommandPalette`)
7. Sidebar (largest single component — data-driven from scratch)
8. Form RHF wrapper (`Form`, `FormField`)
9. Data (`Chart` fused, `DataTable` cleanup, `Tree` / `Image` / `Video` ajustes mínimos, `tableStyles()` helper)
10. Tests rewritten on new API surface
11. Stories rewritten

Detailed plan: see the implementation plan generated from this spec.
