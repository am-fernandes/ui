# `@am-fernandes/ui` — Phase 5: Forms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Ship 8 form components — form, field, select, combobox, multi-select, calendar, date-input, date-range-picker — as `v0.4.0`.

**Architecture:** Components in `src/forms/`. Sources copied from `requerimento-contratos-pf/src/components/ui/{form,field,select,combobox,multi-select,calendar,date-input,date-range-picker}.tsx`. New deps: `@radix-ui/react-select`, `react-hook-form`, `react-day-picker`, `date-fns`. The plan splits execution into 3 chunks for safety (form/field separately from selects, separately from date stack).

**Sources:** All from `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/*.tsx`. `field.tsx` has `dark:` classes — strip them; others clean.

**New deps (exact versions to match requerimento):**
```
@radix-ui/react-select ^2.2.6
date-fns               ^4.1.0
react-day-picker       ^9.14.0
react-hook-form        ^7.71.2
```

## Import path rewrites (apply to every component)

| Source path | Target |
|---|---|
| `@/lib/utils` | `../lib/utils` (or keep alias; both work) |
| `@/components/ui/label` | `../primitives/label` |
| `@/components/ui/separator` | `../primitives/separator` |
| `@/components/ui/badge` | `../primitives/badge` |
| `@/components/ui/button` | `../primitives/button` |
| `@/components/ui/input` | `../primitives/input` |
| `@/components/ui/popover` | `../overlays/popover` |
| `@/components/ui/calendar` | `./calendar` (same folder) |
| `@/components/ui/command` | `../navigation/command` |

## Conventions

- Flat `src/forms/<name>.tsx` + `<name>.stories.tsx`.
- Strip `dark:` (only `field.tsx` has them).
- Keep `"use client"`, `data-slot`, `displayName`, `forwardRef`.
- CSF3 stories `title: "Forms/<Name>"`, `tags: ["autodocs"]`, `layout: "centered"`.
- Append to `src/index.ts` under `// Forms` block.
- Append `"Forms"` to `.storybook/preview.tsx` `storySort.order`.
- One commit per component.

## Tasks

### Task 0: deps + sort

Add the 4 deps to `package.json#dependencies`. `bun install`. Add `"Forms"` to `storySort.order` after `"Navigation"`. Verify gates. Commit `chore(deps): add forms primitives (react-hook-form, react-day-picker, date-fns, @radix-ui/react-select)`.

### Task 1: select

Direct copy. Exports: `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectLabel`, `SelectItem`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`.

Story `Default`: a labeled Select with placeholder "Selecione uma cidade" and 4 items (São Paulo, Rio de Janeiro, Belo Horizonte, Curitiba). Use `Label` from `../primitives/label`.

Commit: `feat(forms): add select`.

### Task 2: form

Direct copy. Source uses `react-hook-form`'s `FormProvider`, `Controller`, `useFormContext`. Exports: `Form` (re-export of FormProvider), `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField`.

Story `Default`: a single-field form (username) with label + description + validation error rendered. Use `useForm` from `react-hook-form` with a Zod resolver only if Zod is already a dep — otherwise plain validation. **Check**: if `zod` isn't installed, use plain RHF `register` validation rules (e.g., `{ required: "Obrigatório" }`).

Commit: `feat(forms): add form`.

### Task 3: field

Read source. Strip `dark:` classes. Exports: `FieldSet`, `FieldLegend`, plus whatever else the source exports (`Field`, `FieldGroup`, etc.).

Story `Default`: a FieldSet wrapping a FieldLegend "Endereço" + a couple of labeled Inputs (Rua, Número) using Label.

Commit: `feat(forms): add field`.

### Task 4: combobox

Direct copy. Uses Badge, Button, Command*, Popover*. Rewrite imports.

Exports per source (likely: `Combobox`, plus any sub-components or types).

Story `Default`: combobox with placeholder "Selecione um cliente" and 5 mock options (e.g., "Empresa A", "Empresa B", …). Provide `value`/`onChange` via story args or a small local state.

Commit: `feat(forms): add combobox`.

### Task 5: multi-select

Direct copy. Same import surface as combobox (Badge, Button, Command*, Popover*).

Story `Default`: multi-select with 5 options, `defaultValue` of 2 selected.

Commit: `feat(forms): add multi-select`.

### Task 6: calendar

Direct copy. Uses `react-day-picker` (DayPicker, getDefaultClassNames, DayButton, Locale types) and `buttonVariants` from `../primitives/button`.

Exports: `Calendar` (and any sub-component the source exports).

Story `Default`: `<Calendar mode="single" selected={selected} onSelect={setSelected} />` with local state via `useState`.

Commit: `feat(forms): add calendar`.

### Task 7: date-input

Direct copy. Uses date-fns (format, parseISO, ptBR locale), Calendar, Input, Popover, Button.

Exports: `DateInput`.

Story `Default`: a labeled DateInput with placeholder "DD/MM/AAAA". Use local state.

Commit: `feat(forms): add date-input`.

### Task 8: date-range-picker

Direct copy. Uses react-day-picker `DateRange` type, Calendar, Popover, Button.

Exports: `DateRangePicker`.

Story `Default`: a date range picker with optional initial range.

Commit: `feat(forms): add date-range-picker`.

### Task 9: Verify + bump + tag

- All gates green.
- `grep -o '"Forms/[^"]*"' storybook-static/index.json | sort -u | wc -l` → 8.
- Bump `package.json#version` to `0.4.0`. Commit `chore(release): bump version to 0.4.0 for Phase 5`.
- Tag `v0.4.0` "Phase 5: 8 form components (form/field/select/combobox/multi-select/calendar/date-input/date-range-picker)".

## Execution chunks

To reduce subagent prompt size and risk, execute in **3 chunks**:

- **Chunk A**: Task 0 + Task 1 (select) + Task 2 (form) + Task 3 (field).
- **Chunk B**: Task 4 (combobox) + Task 5 (multi-select).
- **Chunk C**: Task 6 (calendar) + Task 7 (date-input) + Task 8 (date-range-picker) + Task 9 (bump + tag).

## Risks

- **form.tsx** depends on `react-hook-form`. The example story should use plain RHF (no Zod) unless Zod is detected. The subagent should `grep "zod" package.json`; if absent, use plain `register({ required })` patterns.
- **combobox / multi-select** are the biggest (374 / 317 lines). Imports include Command sub-components — verify our `command.tsx` exports match what they need (`Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem` — all should be there per Phase 4).
- **date-fns v4** has slightly different APIs than v3 in a few corners; the import `import { ptBR } from "date-fns/locale"` should work — if it doesn't, may need `from "date-fns/locale/pt-BR"`.
- **react-day-picker v9** had API changes vs v8 — source already targets v9 so direct copy should work.
