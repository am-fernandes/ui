# `@am-fernandes/ui` — API Simplification Design

**Status:** Draft — pending user review
**Date:** 2026-05-18
**Scope:** API redesign for consistency & predictability across all ~45 exported components

## Rationale

The current API was ported directly from shadcn/ui's compound-component pattern (Radix wrappers). While maximally flexible, this forces consumers to assemble every structure manually — excessive boilerplate for apps that reuse the same patterns. This spec defines a **props-driven, data-driven** API where:

- Every input/control accepts `label`, `error`, `description` directly
- Compound structures (Avatar, RadioGroup, Card) collapse into single components
- Overlays receive `trigger`, `title`, `description`, `children` as flat props
- Navigation components (Accordion, Tabs, Breadcrumb) stay data-driven (already good)
- **No escape hatches** — no compound sub-component exports. The library is opinionated.

## Guiding Principles

1. **Predictability over flexibility** — same patterns everywhere
2. **Single export per component** — no compound sub-components
3. **Props-driven** — `label`, `error`, `description` on all inputs
4. **Children as body** — overlays use `children` for the main content slot
5. **Data-driven** — items/values as array props, not manual JSX assembly

---

## Primitive Components (before → after)

### Avatar

**Before:** `Avatar`, `AvatarImage`, `AvatarFallback` (3 exports, consumer assembles)

**After:** single component

```tsx
<Avatar
  src="https://github.com/shadcn.png"
  alt="@shadcn"
  fallback="CN"
  className=""
/>
```

**Internal:** Renders `AvatarPrimitive.Root` + `AvatarImage` + `AvatarFallback` internally based on props. If `src` is present, renders image; if not or on error, renders fallback.

**Pattern:** explicit `src`, `alt`, `fallback` props. No `children`.

---

### Checkbox

**Before:** single checkbox, label handled externally

**After:** label as prop

```tsx
<Checkbox
  label="Aceito os termos"
  checked={true}
  onCheckedChange={fn}
/>
```

No children. `label` renders a `<Label>` for the checkbox internally, using Radix's implicit-label pattern (clicking label toggles checkbox).

---

### Input

**Before:** raw `<input>`, label handled externally

**After:**

```tsx
<Input
  label="Nome completo"
  labelPosition="up"        // "up" | "left"
  placeholder="Digite seu nome"
  error="Campo obrigatório"
  description="Conforme RG"
/>
```

**Internal:** wraps input in a `Field`-like container. `labelPosition="up"` renders label above input (default), `labelPosition="left"` renders label inline via flex row. `error` renders error message below. `description` renders helper text below.

---

### RadioGroup

**Before:** `RadioGroup` + `RadioGroupItem` (2 exports, consumer assembles items + labels manually, no label binding)

**After:** single component

```tsx
<RadioGroup
  values={[
    { label: "Opção 1", value: "opt1" },
    { label: "Opção 2", value: "opt2", disabled: true },
  ]}
  defaultValue="opt1"
  onValueChange={fn}
  orientation="vertical"    // "vertical" | "horizontal"
  label="Tipo de documento"
  error="Selecione uma opção"
/>
```

**Internal:** renders `<Label>` for label, maps `values` to `RadioGroupItem` + `<Label>` pairs internally. Accessible by default (each item gets `id` from value).

---

### Switch

**Before:** raw toggle, label externally

**After:**

```tsx
<Switch
  label="Notificações push"
  labelPosition="left"      // "left" | "right"
  checked={enabled}
  onCheckedChange={setEnabled}
/>
```

---

### Textarea

**Before:** raw `<textarea>`, label externally

**After:**

```tsx
<Textarea
  label="Descrição"
  placeholder="Digite..."
  error="Campo obrigatório"
  description="Mínimo 10 caracteres"
/>
```

---

### Label

**Removed from exports.** `Label` becomes an internal component used by Input, Checkbox, Switch, RadioGroup, Textarea, etc. No standalone usage — every label is attached to an input.

---

### Badge

**Unchanged.** Already props-driven:

```tsx
<Badge variant="default" className="" />
```

### Button

**Add `loading` prop** for loading/spinner state:

```tsx
<Button variant="default" size="default" loading={isLoading} onClick={fn}>
  Salvar
</Button>
```

When `loading=true`, button is `disabled` and shows a spinner (Lucide `Loader2` with `animate-spin`) before children. The `asChild` prop is **removed** — no Slot escape.

### Separator

**Unchanged.**

### Skeleton

**Unchanged.**

### Typography

**Unchanged.** Already props-driven with `variant` + `as`.

---

## Overlay Components

All overlays follow the same pattern:

### Dialog

```tsx
<Dialog
  trigger={<Button>Abrir</Button>}
  title="Confirmar exclusão"
  description="Esta ação não pode ser desfeita."
  open={open}
  onOpenChange={setOpen}
  hideCloseButton={false}
  closeLabel="Close"
>
  {/* body — custom content */}
  <p>Deseja realmente excluir o item?</p>
</Dialog>
```

**Internal:** renders `DialogPrimitive.Root`, `DialogPrimitive.Trigger` (from `trigger` prop), `DialogPrimitive.Overlay`, `DialogPrimitive.Content` with header (title + description) and close button. `children` renders inside content body. No `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogPortal`, `DialogClose`, `DialogOverlay` exports.

---

### AlertDialog

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
  {/* optional extra body content */}
  <p>O registro será removido permanentemente.</p>
</AlertDialog>
```

**Children placement:** `children` renders above the action buttons, inside the content area. For most cases you don't need children — `title` + `description` + `onConfirm` covers it. Children is for extra context or formatting needs.

No `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogOverlay`, `AlertDialogPortal`, `AlertDialogTrigger` exports.

---

### Sheet

```tsx
<Sheet
  trigger={<Button>Abrir painel</Button>}
  title="Configurações"
  description="Ajuste suas preferências"
  side="right"              // "top" | "bottom" | "left" | "right"
  open={open}
  onOpenChange={setOpen}
>
  {/* body */}
</Sheet>
```

No sub-component exports.

---

### Popover

```tsx
<Popover
  trigger={<Button>Filtrar</Button>}
  align="start"
  sideOffset={4}
  open={open}
  onOpenChange={setOpen}
>
  {/* conteúdo do popover */}
</Popover>
```

No `PopoverAnchor`, `PopoverContent`, `PopoverTrigger` exports — all internal.

---

### Tooltip

```tsx
<Tooltip content="Texto de ajuda">
  <Button>Hover me</Button>
</Tooltip>
```

Single component wrapping `TooltipProvider`, `TooltipPrimitive.Root`, `TooltipPrimitive.Trigger`, `TooltipPrimitive.Content`. No sub-exports.

---

### Collapsible

```tsx
<Collapsible
  title="Configurações avançadas"
  defaultOpen={false}
  triggerSide="right"       // "left" | "right"
  open={open}
  onOpenChange={setOpen}
>
  {/* conteúdo colapsável */}
</Collapsible>
```

No `CollapsibleTrigger`, `CollapsibleContent`, `CollapsibleHeader` exports.

---

### Alert

```tsx
<Alert variant="info" title="Aviso" description="Texto" />
<Alert variant="success" title="Sucesso">Conteúdo mais complexo</Alert>
```

Single component. `AlertTitle` and `AlertDescription` rendered internally when `title`/`description` props present. No sub-exports.

---

### Progress

**Unchanged.** Already single component with `value` prop.

### Sonner / Toaster

**Unchanged.** `Toaster` and `toast` are already minimal. Keep as-is.

---

## Form Components

### Field

**Before:** 11 exports — `Field`, `FieldContent`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLabel`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldTitle`

**After:**

```tsx
{/* Single field */}
<Field
  label="Nome"
  description="Conforme documento"
  error={errors.name?.message}
  orientation="vertical"    // "vertical" | "horizontal" | "responsive"
  required
  disabled
>
  <Input value={name} onChange={setName} />
</Field>

{/* Grouped fields */}
<FieldGroup legend="Dados pessoais">
  <Field label="Nome" error={...}><Input /></Field>
  <Field label="CPF" error={...}><Input /></Field>
</FieldGroup>
```

**Internal:** `Field` renders label (via internal Label), description text, error message (role="alert"), and children (the control). Orientation controls layout direction. `FieldGroup` renders `fieldset` + `legend` and wraps children.

---

### Form

**Before:** `Form` (alias), `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`

**After:**

```tsx
<Form
  schema={schema}
  onSubmit={handleSubmit}
  className="space-y-4"
>
  <FormField
    name="email"
    label="E-mail"
    description="Nunca compartilhamos seu e-mail"
  />
  <FormField
    name="password"
    label="Senha"
    type="password"
  />
  <Button type="submit">Salvar</Button>
</Form>
```

**Internal:** `Form` wraps `FormProvider` + schema validation + form html element. `FormField` renders the RHF `Controller`, the connected `Field` wrapper (label + error + description), and the appropriate input based on type prop (or a custom `render` slot). No separate `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`.

---

### Combobox

**Unchanged.** Already single component. Only adjustment: ensure `label`/`error`/`description` props for consistency.

```tsx
<Combobox
  label="Cidade"
  options={cities}
  value={selected}
  onValueChange={setSelected}
  placeholder="Selecione..."
  creatable
  error={errors.city?.message}
/>
```

---

### Calendar

**Before:** `Calendar` + `CalendarDayButton`

**After:** single component

```tsx
<Calendar
  mode="single"             // "single" | "range" | "multiple"
  selected={date}
  onSelect={setDate}
  locale={ptBR}
  disabledDays={[new Date()]}
/>
```

`CalendarDayButton` is internal.

---

### DateInput

```tsx
<DateInput
  label="Data de nascimento"
  value="1990-01-15"
  onChange={setDate}
  error={errors.data?.message}
  placeholder="dd/mm/aaaa"
/>
```

---

### DateRangePicker

```tsx
<DateRangePicker
  label="Período"
  value={{ from: start, to: end }}
  onChange={setRange}
  error={errors.periodo?.message}
/>
```

### TimePicker

```tsx
<TimePicker
  label="Horário"
  value="14:30"
  onChange={setTime}
/>
```

---

## Navigation Components

### Accordion

**Already data-driven.** Adjust for consistency:

```tsx
<Accordion
  type="single"             // "single" | "multiple"
  collapsible
  items={[
    { value: "item1", title: "Seção 1", content: <p>...</p> },
    { value: "item2", title: "Seção 2", content: <p>...</p> },
  ]}
  defaultValue="item1"
  onValueChange={fn}
/>
```

Single export (`Accordion`). `AccordionItemData` type remains exported.

---

### Tabs

**Already data-driven.** Adjust for consistency:

```tsx
<Tabs
  items={[
    { value: "tab1", label: "Geral", content: <div>...</div> },
    { value: "tab2", label: "Avançado", content: <div>...</div> },
  ]}
  defaultValue="tab1"
  orientation="horizontal"
/>
```

Single export (`Tabs`). `TabsItemData` type remains exported.

---

### Breadcrumb

**Already data-driven.** Adjust for consistency:

```tsx
<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Usuários", href: "/users" },
    { label: "Editar" },
  ]}
/>
```

Single export (`Breadcrumb`). `BreadcrumbItemData` type remains exported.

---

### Command

**Before:** 10 exports — `Command`, `CommandDialog`, `CommandEmpty`, `CommandGroup`, `CommandInput`, `CommandItem`, `CommandList`, `CommandSeparator`, `CommandShortcut`

**After:** single `CommandPalette` component

```tsx
<CommandPalette
  open={open}
  onOpenChange={setOpen}
  groups={[
    {
      heading: "Navegação",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, onSelect: () => navigate("/") },
        { label: "Perfil", icon: User, onSelect: () => navigate("/profile") },
      ],
    },
    {
      heading: "Ações",
      items: [
        { label: "Exportar dados", icon: Download, onSelect: handleExport },
      ],
    },
  ]}
/>
```

Internal renders `Dialog` + `Command` + `CommandInput` + `CommandList` + `CommandGroup` + `CommandItem`. All sub-components are internal — no exports.

---

### Sidebar

**Before:** ~25 exports — `Sidebar`, `SidebarProvider`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarHeader`, `SidebarFooter`, `SidebarInput`, `SidebarInset`, `SidebarRail`, `SidebarSeparator`, `SidebarTrigger`, `useSidebar`

**After:** single component

```tsx
<Sidebar
  items={[
    { label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Usuários", icon: Users, href: "/users" },
    {
      label: "Relatórios",
      icon: BarChart3,
      children: [
        { label: "Financeiro", href: "/reports/financeiro" },
        { label: "Operacional", href: "/reports/operacional" },
      ],
    },
  ]}
  header={<div className="p-4"><Logo /></div>}
  footer={<div className="p-4"><UserAvatar /></div>}
  collapsible="icon"        // "offcanvas" | "icon" | "none"
  side="left"               // "left" | "right"
  variant="sidebar"         // "sidebar" | "floating" | "inset"
  defaultOpen={true}
  persistOpenState={false}
  keyboardShortcut="b"
/>
```

**Internal:** renders `SidebarProvider`, `Sidebar`, all menu/group/sub-menu structure internally. No sub-component exports.

---

## Data Components

### Card

**Before:** 6 exports — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

**After:** single component

```tsx
<Card
  title="Título do card"
  description="Descrição opcional"
  footer={<div className="flex justify-end"><Button>Salvar</Button></div>}
>
  {/* body / content */}
</Card>
```

**Children placement:** `children` is the body content, rendered inside `CardContent`. When no `title`/`description`/`footer` is needed, `children` alone works as a simple container.

No sub-component exports.

---

### Table

**Removed.** All table use cases go through `DataTable`.

---

### DataTable

**Main table component.** Already props-driven, adjust for consistency:

```tsx
<DataTable
  columns={columns}
  data={users}
  searchableColumns={["name", "email"]}
  searchPlaceholder="Buscar..."
  pagination={{ pageSize: 10 }}
  showRowCount
  sorting={sorting}
  onSortingChange={setSorting}
/>
```

All sub-tables (`Table`, `TableHeader`, `TableBody`, etc.) are internal — not exported.

---

### Image

```tsx
<Image
  src="/foto.jpg"
  alt="Descrição"
  aspectRatio={16/9}
  objectFit="cover"
  rounded="md"
  placeholder="skeleton"
  loading="lazy"
/>
```

Already single component. Minor adjustments only (remove `srcSet`, `sizes`, `allowedProtocols`, `decorative` props if they add unnecessary complexity — YAGNI check).

---

### Video

```tsx
<Video
  src="/video.mp4"
  aria-label="Vídeo explicativo"
  poster="/thumb.jpg"
  captions={[{ src: "/legenda.vtt", srcLang: "pt", label: "Português" }]}
  aspectRatio={16/9}
/>
```

Already single component. Minor adjustments only.

---

### ScrollArea

**Unchanged.** Already single component with `orientation`.

### Tree

**Already data-driven.** Minor adjustments:

```tsx
<Tree
  data={[
    { id: "1", label: "Pasta", icon: Folder, children: [
      { id: "2", label: "Arquivo.pdf", icon: File },
    ]},
  ]}
  defaultExpanded={["1"]}
  selected={selectedId}
  onSelectedChange={setSelectedId}
/>
```

---

### Chart

**Already props-driven** (wraps Recharts). Keep `ChartContainer`, `ChartTooltip`, `ChartLegend` as exports but merge `ChartTooltipContent` into `ChartTooltip` (internal) and `ChartLegendContent` into `ChartLegend` (internal).

```tsx
<ChartContainer config={config}>
  <LineChart data={data}>
    <ChartTooltip indicator="dot" />
    <ChartLegend />
    <CartesianGrid />
    <XAxis dataKey="month" />
    <ChartLine dataKey="revenue" />
  </LineChart>
</ChartContainer>
```

---

## Domain Components

### CurrencyInput

```tsx
<CurrencyInput
  label="Valor"
  value={150.50}
  onValueChange={setValor}
  error={errors.valor?.message}
  disabled={isSubmitting}
/>
```

### PercentageInput

```tsx
<PercentageInput
  label="Taxa de juros"
  value={12.5}
  onValueChange={setTaxa}
  max={100}
  error={errors.taxa?.message}
/>
```

### InputOTP

**Before:** 4 exports — `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`

**After:** single component

```tsx
<InputOTP
  label="Código de verificação"
  length={6}
  value={code}
  onValueChange={setCode}
  pattern={REGEXP_ONLY_DIGITS}
  separatorEvery={3}
  separator="-"
  error={errors.code?.message}
/>
```

### MultiInput

```tsx
<MultiInput
  type="string"             // "string" | "number"
  label="Tags"
  value={tags}
  onValueChange={setTags}
  placeholder="Adicione uma tag"
  error={errors.tags?.message}
/>
```

### FileUpload

```tsx
<FileUpload
  label="Comprovante"
  accept="image/*"
  maxSize={mb(5)}
  multiple={false}
  preview="thumbnail"
  value={files}
  onValueChange={setFiles}
  onReject={handleReject}
  error={errors.comprovante?.message}
  disabled={isSubmitting}
/>
```

Already single component. Add `label`/`error` consistency.

---

## Hooks & Lib

| Export | Status |
|--------|--------|
| `useIsMobile` | ✅ Maintain |
| `cn` | ✅ Maintain |
| `centsToDisplay`, `toCents`, `fromCents`, `formatBRL`, `percentFromValue`, `percentOfTotal` | ✅ Maintain |
| `bytes`, `kb`, `mb`, `gb` | ✅ Maintain |

---

## Export Impact Summary

| Category | Current Exports | Proposed Exports | Reduction |
|----------|----------------|------------------|-----------|
| Primitives | 13 | 7 | -46% |
| Overlays | 31 | 7 | -77% |
| Forms | 19 | 5 | -74% |
| Navigation | 44 | 6 | -86% |
| Data | 22 | 6 | -73% |
| Domain | 8 | 5 | -38% |
| Hooks/Lib | 8 | 8 | — |
| **Total** | **~145** | **~44** | **~70%** |

---

## Open Decisions

- **Button `asChild` removal** — confirmed, no `Slot` escape.
- **Calendar** — confirm `react-day-picker` v9 API compatibility with new wrapper.
- **Chart** — `ChartTooltipContent`/`ChartLegendContent` internalized; consumers use `ChartTooltip` and `ChartLegend` directly.
- **DataTable** — covers all table needs; raw `Table` component removed.
- **CommandPalette** — rename from `Command` for clarity.
- **MultiInput** — `type="string" | "number"` prop vs two separate components. Single component with discriminated union keeps it simple.
