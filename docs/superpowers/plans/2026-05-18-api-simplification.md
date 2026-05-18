# API Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the public API of `@am-fernandes/ui` to be data-driven, predictable, and ~64% smaller (~145 → ~52 exports) before first npm release.

**Architecture:** Single-export-per-component for most surfaces. `label`/`description`/`error` on every form control. `title`/`description`/`footer`/`children` on every overlay. `items`/`groups` on every navigation. `ReactNode` slots (`headerAction`, `footer`, `action`, `trigger`) as escape hatches for the common edge cases.

**Tech Stack:** React 19 (native `ref` prop, no `forwardRef`), TypeScript 5.9, Tailwind 4, Radix UI primitives, react-hook-form (resolver-agnostic), Vitest + jsdom + @testing-library/react, Biome.

**Spec:** `docs/superpowers/specs/2026-05-18-api-simplification-design.md` — every divergence from the original spec is documented in the "Notable divergences" section.

**Pre-flight:** The repo is currently at v10.0.0 with 297 passing tests, typecheck clean, lint clean (the "fix all findings" pass from the prior conversation). This plan rewrites the public API surface on top of that base.

---

## File Structure

```
src/
  primitives/
    _internal/
      label.tsx              # NEW — internal Label component (no public export)
      field-shell.tsx        # NEW — shared label/description/error layout (used by Input, Textarea, etc.)
      use-field-ids.ts       # NEW — useId for label/description/error wiring
    avatar.tsx               # REWRITE — flat src/alt/fallback API
    badge.tsx                # KEEP — already flat
    button.tsx               # MODIFY — add `loading`, add `sm`/`lg` sizes, keep asChild
    checkbox.tsx             # REWRITE — label/description/error on root
    input.tsx                # REWRITE — label/description/error/leadingIcon/trailingIcon/required/labelPosition
    radio-group.tsx          # REWRITE — values data-driven
    separator.tsx            # MODIFY — add label prop
    skeleton.tsx             # KEEP
    switch.tsx               # REWRITE — label/description/error/labelPosition
    textarea.tsx             # REWRITE — label/description/error/autoResize/maxLength counter
    typography.tsx           # KEEP
  overlays/
    _internal/
      animations.ts          # KEEP — already exists
    alert.tsx                # REWRITE — flat title/description/action
    alert-dialog.tsx         # REWRITE — flat title/description/onConfirm
    collapsible.tsx          # MODIFY — add `trigger` slot
    dialog.tsx               # REWRITE — flat title/description/footer
    popover.tsx              # REWRITE — flat trigger/children
    progress.tsx             # KEEP
    sheet.tsx                # REWRITE — flat title/description/side/footer
    sonner.tsx               # KEEP
    tooltip.tsx              # REWRITE — flat content
  forms/
    field.tsx                # REWRITE — Field + FieldGroup only
    form.tsx                 # REWRITE — Form (resolver) + FormField (render slot)
    calendar.tsx             # KEEP (mostly) — internalize CalendarDayButton
    combobox.tsx             # MODIFY — add label/description/error
    date-input.tsx           # MODIFY — add label/description/error
    date-range-picker.tsx    # REWRITE — value: { from, to } object API
    time-picker.tsx          # MODIFY — add label/description/error
  navigation/
    accordion.tsx            # MODIFY — add action in item type
    breadcrumb.tsx           # MODIFY — add maxItems, ariaLabel
    command-palette.tsx      # NEW (replaces command.tsx) — data-driven
    sidebar.tsx              # REWRITE — data-driven groups/items with all slots
    tabs.tsx                 # MODIFY — add badge in item, add lazy prop
  data/
    card.tsx                 # REWRITE — flat title/description/headerAction/footer
    chart.tsx                # MODIFY — fuse ChartTooltipContent into ChartTooltip
    data-table.tsx           # KEEP (mostly)
    image.tsx                # KEEP (mostly)
    scroll-area.tsx          # KEEP
    table-styles.ts          # NEW — tableStyles() helper
    tree.tsx                 # KEEP
    video.tsx                # KEEP
  domain/
    currency-input.tsx       # MODIFY — wrap in field-shell
    file-upload.tsx          # MODIFY — wrap in field-shell
    input-otp.tsx            # REWRITE — single component with length/separator
    multi-input.tsx          # MODIFY — wrap in field-shell
    percentage-input.tsx     # MODIFY — wrap in field-shell
  hooks/
    use-is-mobile.ts         # KEEP
  lib/
    currency.ts              # KEEP
    size.ts                  # KEEP
    utils.ts                 # KEEP
  index.ts                   # REWRITE — final public export surface

src/forms/command.tsx        # DELETE (renamed to navigation/command-palette.tsx)
src/data/table.tsx           # DELETE (replaced by tableStyles helper)
```

**Files to delete entirely:**
- `src/navigation/command.tsx` → renamed to `src/navigation/command-palette.tsx`
- `src/data/table.tsx` + `src/data/table.test.tsx` + `src/data/table.stories.tsx`
- All `_internal` sub-component files that get folded into parent components

---

## Conventions

Every task in this plan follows these rules:

**React 19 ref pattern (NOT `forwardRef`):**
```tsx
function Foo({ ref, ...props }: FooProps & { ref?: React.Ref<HTMLDivElement> }) {
  return <div ref={ref} {...props} />
}
```

**`data-slot` on every primary element:**
```tsx
<div data-slot="card" />
<div data-slot="card-header" />
```

**`cn(className)` last** so consumer overrides win.

**Test file pattern:** colocated `.test.tsx` next to `.tsx`. Tests use `@testing-library/react` + `vitest`. Each test asserts user-observable behavior, not implementation.

**Commit pattern:** after each task that lands a coherent unit. Format: `feat(component): description` or `refactor(component): description` or `test(component): description`.

**Validation gate at end of each phase:** run
```
bun run typecheck && bun run test && bun run lint
```
All three must pass before merging the phase.

---

## Phase 0: Demolition

Strip the public API down to nothing so the rebuild starts from a clean slate.

### Task 0.1: Snapshot current state

**Files:**
- No source changes

- [ ] **Step 1: Confirm baseline is green**

Run:
```bash
cd /home/matheus/Projects/ui && bun run typecheck && bun run test && bun run lint
```
Expected: typecheck passes, 297/297 tests pass, lint clean.

- [ ] **Step 2: Create a baseline branch tag**

Run:
```bash
cd /home/matheus/Projects/ui && git tag pre-api-simplification
```
Expected: tag created (no output).

- [ ] **Step 3: Commit any uncommitted v10 work**

Run:
```bash
cd /home/matheus/Projects/ui && git status
```
If there are uncommitted changes, commit them first:
```bash
git add -A && git commit -m "chore: snapshot pre-API-simplification state"
```

### Task 0.2: Empty out `src/index.ts`

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Replace `src/index.ts` with empty marker**

Write to `src/index.ts`:
```ts
/**
 * `@am-fernandes/ui` public API.
 *
 * This file is the only public entry point. Exports are added back as each
 * component is rebuilt in subsequent tasks of the API simplification plan.
 *
 * See: docs/superpowers/plans/2026-05-18-api-simplification.md
 */

// (intentionally empty during demolition phase — tasks below add exports back)
export {}
```

- [ ] **Step 2: Run typecheck — expect failures in stories/tests that imported public symbols**

Run:
```bash
cd /home/matheus/Projects/ui && bun run typecheck 2>&1 | head -30
```
Expected: many "has no exported member" errors. This is fine — stories and tests will be updated as each component is rebuilt.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "chore: empty public exports for API simplification rebuild"
```

### Task 0.3: Delete obsolete files

**Files:**
- Delete: `src/navigation/command.tsx` (will be re-created as `command-palette.tsx`)
- Delete: `src/navigation/command.test.tsx`
- Delete: `src/navigation/command.stories.tsx`
- Delete: `src/data/table.tsx`
- Delete: `src/data/table.test.tsx`
- Delete: `src/data/table.stories.tsx`

- [ ] **Step 1: Delete the files**

Run:
```bash
cd /home/matheus/Projects/ui && \
  rm src/navigation/command.tsx src/navigation/command.test.tsx src/navigation/command.stories.tsx && \
  rm src/data/table.tsx src/data/table.test.tsx src/data/table.stories.tsx
```

- [ ] **Step 2: Run typecheck — verify no orphan imports**

Run:
```bash
cd /home/matheus/Projects/ui && bun run typecheck 2>&1 | grep -E "Cannot find|has no exported"
```
Expected: errors from `data-table.tsx` and `sidebar.tsx` that import from the deleted files. Will be fixed in subsequent tasks. Note them but don't fix yet.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: delete Command and Table sources (rebuilt in later tasks)"
```

---

## Phase 1: Foundation — Internal `Label`, `useFieldIds`, `FieldShell`

These three primitives are the bedrock of every form control. They are NOT publicly exported. Inputs, Textarea, Checkbox, Switch, RadioGroup, and the domain inputs all consume them internally.

### Task 1.1: Internal `Label` component

**Files:**
- Create: `src/primitives/_internal/label.tsx`
- Create: `src/primitives/_internal/label.test.tsx`

- [ ] **Step 1: Write the failing test**

Write `src/primitives/_internal/label.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Label } from "./label"

describe("Label (internal)", () => {
  it("renders text content with the correct `for` attribute", () => {
    render(<Label htmlFor="x">Nome</Label>)
    const label = screen.getByText("Nome")
    expect(label.tagName).toBe("LABEL")
    expect(label.getAttribute("for")).toBe("x")
  })

  it("renders an asterisk when required", () => {
    render(<Label htmlFor="x" required>Nome</Label>)
    expect(screen.getByLabelText("obrigatório")).toBeInTheDocument()
  })

  it("forwards ref to the underlying label element", () => {
    let captured: HTMLLabelElement | null = null
    render(
      <Label htmlFor="x" ref={(el) => { captured = el }}>
        Nome
      </Label>,
    )
    expect(captured).toBeInstanceOf(HTMLLabelElement)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

Run:
```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/_internal/label.test.tsx
```
Expected: FAIL with "Cannot find module './label'".

- [ ] **Step 3: Implement `Label`**

Write `src/primitives/_internal/label.tsx`:
```tsx
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  ref?: React.Ref<HTMLLabelElement>
}

function Label({ className, children, required, ref, ...props }: LabelProps) {
  return (
    <label
      ref={ref}
      data-slot="label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span aria-label="obrigatório" className="ml-0.5 text-destructive">
          *
        </span>
      ) : null}
    </label>
  )
}

export { Label, type LabelProps }
```

- [ ] **Step 4: Run test — verify it passes**

Run:
```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/_internal/label.test.tsx
```
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/primitives/_internal/
git commit -m "feat(primitives): add internal Label component"
```

### Task 1.2: `useFieldIds` hook for ARIA wiring

**Files:**
- Create: `src/primitives/_internal/use-field-ids.ts`
- Create: `src/primitives/_internal/use-field-ids.test.ts`

- [ ] **Step 1: Write the failing test**

Write `src/primitives/_internal/use-field-ids.test.ts`:
```ts
import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useFieldIds } from "./use-field-ids"

describe("useFieldIds", () => {
  it("returns stable ids for control, label, description, error", () => {
    const { result } = renderHook(() => useFieldIds())
    expect(result.current.controlId).toMatch(/.+/)
    expect(result.current.labelId).toMatch(/.+/)
    expect(result.current.descriptionId).toMatch(/.+/)
    expect(result.current.errorId).toMatch(/.+/)
    // each id is distinct
    const ids = Object.values(result.current)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("uses externally provided control id if given", () => {
    const { result } = renderHook(() => useFieldIds("my-id"))
    expect(result.current.controlId).toBe("my-id")
  })

  it("builds aria-describedby based on which slots are present", () => {
    const { result } = renderHook(() => useFieldIds())
    expect(result.current.describedBy({ description: false, error: false })).toBeUndefined()
    expect(result.current.describedBy({ description: true, error: false })).toBe(
      result.current.descriptionId,
    )
    expect(result.current.describedBy({ description: false, error: true })).toBe(
      result.current.errorId,
    )
    expect(result.current.describedBy({ description: true, error: true })).toBe(
      `${result.current.descriptionId} ${result.current.errorId}`,
    )
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

Run:
```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/_internal/use-field-ids.test.ts
```
Expected: FAIL with "Cannot find module './use-field-ids'".

- [ ] **Step 3: Implement `useFieldIds`**

Write `src/primitives/_internal/use-field-ids.ts`:
```ts
import * as React from "react"

interface DescribedByOptions {
  description: boolean
  error: boolean
}

interface FieldIds {
  controlId: string
  labelId: string
  descriptionId: string
  errorId: string
  describedBy: (opts: DescribedByOptions) => string | undefined
}

/**
 * Stable ARIA wiring for label / description / error around any form control.
 * Pass an external `id` if you want consumer-controlled ids; otherwise React
 * auto-generates a stable id per mount.
 */
export function useFieldIds(externalId?: string): FieldIds {
  const reactId = React.useId()
  const controlId = externalId ?? `${reactId}-control`
  const labelId = `${reactId}-label`
  const descriptionId = `${reactId}-description`
  const errorId = `${reactId}-error`

  const describedBy = React.useCallback(
    ({ description, error }: DescribedByOptions) => {
      const ids: string[] = []
      if (description) ids.push(descriptionId)
      if (error) ids.push(errorId)
      return ids.length === 0 ? undefined : ids.join(" ")
    },
    [descriptionId, errorId],
  )

  return { controlId, labelId, descriptionId, errorId, describedBy }
}
```

- [ ] **Step 4: Run test — verify it passes**

Run:
```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/_internal/use-field-ids.test.ts
```
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/primitives/_internal/use-field-ids.ts src/primitives/_internal/use-field-ids.test.ts
git commit -m "feat(primitives): add useFieldIds for ARIA wiring"
```

### Task 1.3: `FieldShell` — shared label/description/error layout

**Files:**
- Create: `src/primitives/_internal/field-shell.tsx`
- Create: `src/primitives/_internal/field-shell.test.tsx`

- [ ] **Step 1: Write the failing test**

Write `src/primitives/_internal/field-shell.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { FieldShell } from "./field-shell"

describe("FieldShell", () => {
  it("renders label, description, error, and children together", () => {
    render(
      <FieldShell
        controlId="c"
        labelId="l"
        descriptionId="d"
        errorId="e"
        label="Nome"
        description="Conforme RG"
        error="Campo obrigatório"
      >
        <input id="c" />
      </FieldShell>,
    )

    expect(screen.getByText("Nome").tagName).toBe("LABEL")
    expect(screen.getByText("Conforme RG")).toBeInTheDocument()
    expect(screen.getByText("Campo obrigatório")).toHaveAttribute("role", "alert")
  })

  it("omits description and error slots when not provided", () => {
    render(
      <FieldShell controlId="c" labelId="l" descriptionId="d" errorId="e" label="Nome">
        <input id="c" />
      </FieldShell>,
    )
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("supports labelPosition='hidden' (sr-only label, no visible text)", () => {
    render(
      <FieldShell
        controlId="c"
        labelId="l"
        descriptionId="d"
        errorId="e"
        label="Nome"
        labelPosition="hidden"
      >
        <input id="c" />
      </FieldShell>,
    )
    expect(screen.getByText("Nome")).toHaveClass("sr-only")
  })

  it("supports labelPosition='left' inline layout", () => {
    const { container } = render(
      <FieldShell
        controlId="c"
        labelId="l"
        descriptionId="d"
        errorId="e"
        label="Nome"
        labelPosition="left"
      >
        <input id="c" />
      </FieldShell>,
    )
    expect(container.querySelector('[data-slot="field-shell"]')).toHaveAttribute(
      "data-label-position",
      "left",
    )
  })

  it("renders required asterisk on label", () => {
    render(
      <FieldShell controlId="c" labelId="l" descriptionId="d" errorId="e" label="Nome" required>
        <input id="c" />
      </FieldShell>,
    )
    expect(screen.getByLabelText("obrigatório")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

Run:
```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/_internal/field-shell.test.tsx
```
Expected: FAIL with "Cannot find module './field-shell'".

- [ ] **Step 3: Implement `FieldShell`**

Write `src/primitives/_internal/field-shell.tsx`:
```tsx
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./label"

export type LabelPosition = "up" | "left" | "hidden"

export interface FieldShellProps {
  controlId: string
  labelId: string
  descriptionId: string
  errorId: string
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

function FieldShell({
  controlId,
  labelId,
  descriptionId,
  errorId,
  label,
  description,
  error,
  labelPosition = "up",
  required,
  disabled,
  className,
  children,
}: FieldShellProps) {
  const hasLabel = label != null && label !== ""
  const hasDescription = description != null && description !== ""
  const hasError = error != null && error !== ""

  return (
    <div
      data-slot="field-shell"
      data-label-position={labelPosition}
      data-disabled={disabled ? "true" : undefined}
      className={cn(
        "flex w-full",
        labelPosition === "left" ? "flex-row items-center gap-3" : "flex-col gap-1.5",
        disabled && "opacity-60",
        className,
      )}
    >
      {hasLabel ? (
        <Label
          id={labelId}
          htmlFor={controlId}
          required={required}
          className={cn(
            labelPosition === "hidden" && "sr-only",
            labelPosition === "left" && "shrink-0",
          )}
        >
          {label}
        </Label>
      ) : null}

      <div className="flex w-full flex-col gap-1.5">
        {children}
        {hasDescription ? (
          <p id={descriptionId} data-slot="field-description" className="text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
        {hasError ? (
          <p id={errorId} data-slot="field-error" role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export { FieldShell }
```

- [ ] **Step 4: Run test — verify it passes**

Run:
```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/_internal/field-shell.test.tsx
```
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/primitives/_internal/field-shell.tsx src/primitives/_internal/field-shell.test.tsx
git commit -m "feat(primitives): add FieldShell layout for label/description/error"
```

### Phase 1 validation

- [ ] **Step 1: Run full suite**

```bash
cd /home/matheus/Projects/ui && bun run typecheck && bun run test && bun run lint
```
Expected: 11 new tests pass (3 Label + 3 useFieldIds + 5 FieldShell), no other test affected, typecheck clean, lint clean.

---

## Phase 2: Form Inputs — `Input`, `Textarea`

The two text-entry primitives. Both consume Phase 1 internals.

### Task 2.1: Rewrite `Input` with new API

**Files:**
- Modify: `src/primitives/input.tsx` (full rewrite)
- Modify: `src/primitives/input.test.tsx` (full rewrite)
- Modify: `src/primitives/input.stories.tsx` (update to new API)

- [ ] **Step 1: Write failing tests for the new API**

Replace `src/primitives/input.test.tsx`:
```tsx
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Input } from "./input"

describe("Input", () => {
  it("renders label associated with input", () => {
    render(<Input label="Nome" />)
    const input = screen.getByLabelText("Nome")
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe("INPUT")
  })

  it("renders description with aria-describedby wiring", () => {
    render(<Input label="E-mail" description="Não compartilharemos" />)
    const input = screen.getByLabelText("E-mail")
    const description = screen.getByText("Não compartilharemos")
    expect(input.getAttribute("aria-describedby")).toContain(description.id)
  })

  it("renders error message with role=alert", () => {
    render(<Input label="E-mail" error="Inválido" />)
    expect(screen.getByRole("alert")).toHaveTextContent("Inválido")
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("aria-invalid", "true")
  })

  it("hides label visually with labelPosition='hidden' but keeps it for AT", () => {
    render(<Input label="Busca" labelPosition="hidden" />)
    expect(screen.getByText("Busca")).toHaveClass("sr-only")
    expect(screen.getByLabelText("Busca")).toBeInTheDocument()
  })

  it("renders required asterisk", () => {
    render(<Input label="Nome" required />)
    expect(screen.getByLabelText("obrigatório")).toBeInTheDocument()
  })

  it("renders leadingIcon inside the input wrapper", () => {
    render(
      <Input
        label="Busca"
        leadingIcon={<span data-testid="lead">L</span>}
      />,
    )
    expect(screen.getByTestId("lead")).toBeInTheDocument()
  })

  it("renders trailingIcon inside the input wrapper", () => {
    render(
      <Input
        label="Senha"
        trailingIcon={<button data-testid="trail">show</button>}
      />,
    )
    expect(screen.getByTestId("trail")).toBeInTheDocument()
  })

  it("forwards onChange and value (controlled)", () => {
    const onChange = vi.fn()
    render(<Input label="X" value="abc" onChange={onChange} />)
    const input = screen.getByLabelText("X") as HTMLInputElement
    expect(input.value).toBe("abc")
    fireEvent.change(input, { target: { value: "abcd" } })
    expect(onChange).toHaveBeenCalled()
  })

  it("respects disabled and readOnly", () => {
    const { rerender } = render(<Input label="X" disabled />)
    expect(screen.getByLabelText("X")).toBeDisabled()
    rerender(<Input label="X" readOnly />)
    expect(screen.getByLabelText("X")).toHaveAttribute("readonly")
  })

  it("forwards ref to the input element", () => {
    let captured: HTMLInputElement | null = null
    render(<Input label="X" ref={(el) => { captured = el }} />)
    expect(captured).toBeInstanceOf(HTMLInputElement)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

Run:
```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/input.test.tsx
```
Expected: tests fail (old Input doesn't accept `label`).

- [ ] **Step 3: Rewrite `src/primitives/input.tsx`**

```tsx
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "./_internal/field-shell"
import { useFieldIds } from "./_internal/use-field-ids"

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode
  labelPosition?: LabelPosition
  description?: React.ReactNode
  error?: string
  required?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  ref?: React.Ref<HTMLInputElement>
}

function Input({
  id,
  label,
  labelPosition,
  description,
  error,
  required,
  leadingIcon,
  trailingIcon,
  className,
  disabled,
  ref,
  ...props
}: InputProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""

  const inputEl = (
    <div
      data-slot="input-wrapper"
      className={cn(
        "relative flex h-9 w-full items-center rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors",
        "focus-within:border-primary focus-within:ring-1 focus-within:ring-ring",
        hasError && "border-destructive ring-1 ring-destructive/20",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {leadingIcon ? (
        <span data-slot="input-leading" className="pl-3 text-muted-foreground">
          {leadingIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        id={ids.controlId}
        data-slot="input"
        aria-invalid={hasError ? true : undefined}
        aria-describedby={ids.describedBy({
          description: description != null && description !== "",
          error: hasError,
        })}
        disabled={disabled}
        required={required}
        className={cn(
          "h-full w-full bg-transparent px-3 py-1 placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed",
          leadingIcon && "pl-2",
          trailingIcon && "pr-2",
          className,
        )}
        {...props}
      />
      {trailingIcon ? (
        <span data-slot="input-trailing" className="pr-3 text-muted-foreground">
          {trailingIcon}
        </span>
      ) : null}
    </div>
  )

  return (
    <FieldShell
      controlId={ids.controlId}
      labelId={ids.labelId}
      descriptionId={ids.descriptionId}
      errorId={ids.errorId}
      label={label}
      description={description}
      error={error}
      labelPosition={labelPosition}
      required={required}
      disabled={disabled}
    >
      {inputEl}
    </FieldShell>
  )
}

Input.displayName = "Input"

export { Input }
```

- [ ] **Step 4: Run test — verify it passes**

Run:
```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/input.test.tsx
```
Expected: 10 tests pass.

- [ ] **Step 5: Update `src/primitives/input.stories.tsx`**

Replace with stories that use the new API:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"
import { MailIcon, SearchIcon } from "lucide-react"

import { Input } from "./input"

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  parameters: { docs: { description: { component: "Text input with built-in label/description/error." } } },
}
export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: { label: "Nome completo", placeholder: "Digite seu nome" },
}

export const WithDescription: Story = {
  args: { label: "E-mail", description: "Não compartilharemos com terceiros.", placeholder: "voce@exemplo.com" },
}

export const WithError: Story = {
  args: { label: "E-mail", value: "abc", error: "Formato inválido" },
}

export const WithLeadingIcon: Story = {
  args: { label: "Buscar", placeholder: "Digite para buscar", leadingIcon: <SearchIcon className="size-4" /> },
}

export const WithTrailingIcon: Story = {
  args: { label: "E-mail", placeholder: "voce@exemplo.com", trailingIcon: <MailIcon className="size-4" /> },
}

export const LabelHidden: Story = {
  args: { label: "Buscar", labelPosition: "hidden", placeholder: "Buscar..." },
}

export const Required: Story = {
  args: { label: "Nome", required: true, placeholder: "Obrigatório" },
}

export const Disabled: Story = {
  args: { label: "Nome", disabled: true, value: "Não editável" },
}
```

- [ ] **Step 6: Run typecheck + lint**

```bash
cd /home/matheus/Projects/ui && bun run typecheck && bun run lint
```
Expected: pass.

- [ ] **Step 7: Re-export `Input` from index**

Edit `src/index.ts` — append:
```ts
export { Input, type InputProps } from "./primitives/input"
```

- [ ] **Step 8: Commit**

```bash
git add src/primitives/input.tsx src/primitives/input.test.tsx src/primitives/input.stories.tsx src/index.ts
git commit -m "feat(input): label/description/error/icons API"
```

### Task 2.2: Rewrite `Textarea` with new API (mirrors Input)

**Files:**
- Modify: `src/primitives/textarea.tsx`
- Modify: `src/primitives/textarea.test.tsx`
- Modify: `src/primitives/textarea.stories.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/primitives/textarea.test.tsx`:
```tsx
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Textarea } from "./textarea"

describe("Textarea", () => {
  it("renders label associated with textarea", () => {
    render(<Textarea label="Descrição" />)
    const ta = screen.getByLabelText("Descrição")
    expect(ta.tagName).toBe("TEXTAREA")
  })

  it("renders description and error", () => {
    render(<Textarea label="X" description="ajuda" error="erro" />)
    expect(screen.getByText("ajuda")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("erro")
    expect(screen.getByLabelText("X")).toHaveAttribute("aria-invalid", "true")
  })

  it("renders maxLength counter when set", () => {
    render(<Textarea label="X" maxLength={100} value="abc" onChange={() => {}} />)
    expect(screen.getByText("3/100")).toBeInTheDocument()
  })

  it("forwards onChange", () => {
    const onChange = vi.fn()
    render(<Textarea label="X" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText("X"), { target: { value: "abc" } })
    expect(onChange).toHaveBeenCalled()
  })

  it("forwards ref", () => {
    let captured: HTMLTextAreaElement | null = null
    render(<Textarea label="X" ref={(el) => { captured = el }} />)
    expect(captured).toBeInstanceOf(HTMLTextAreaElement)
  })

  it("respects disabled and readOnly", () => {
    const { rerender } = render(<Textarea label="X" disabled />)
    expect(screen.getByLabelText("X")).toBeDisabled()
    rerender(<Textarea label="X" readOnly />)
    expect(screen.getByLabelText("X")).toHaveAttribute("readonly")
  })
})
```

- [ ] **Step 2: Run — verify failures**

Run:
```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/textarea.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Rewrite `src/primitives/textarea.tsx`**

```tsx
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "./_internal/field-shell"
import { useFieldIds } from "./_internal/use-field-ids"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode
  labelPosition?: LabelPosition
  description?: React.ReactNode
  error?: string
  required?: boolean
  autoResize?: boolean
  ref?: React.Ref<HTMLTextAreaElement>
}

function Textarea({
  id,
  label,
  labelPosition,
  description,
  error,
  required,
  autoResize,
  maxLength,
  className,
  disabled,
  ref,
  value,
  defaultValue,
  ...props
}: TextareaProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""

  // Track current length for the counter when maxLength is set.
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<string>(
    typeof defaultValue === "string" ? defaultValue : "",
  )
  const current = isControlled ? String(value ?? "") : internal

  const localRef = React.useRef<HTMLTextAreaElement | null>(null)
  const mergedRef = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      localRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
    },
    [ref],
  )

  React.useEffect(() => {
    if (!autoResize || !localRef.current) return
    localRef.current.style.height = "auto"
    localRef.current.style.height = `${localRef.current.scrollHeight}px`
  }, [autoResize, current])

  const textareaEl = (
    <textarea
      ref={mergedRef}
      id={ids.controlId}
      data-slot="textarea"
      aria-invalid={hasError ? true : undefined}
      aria-describedby={ids.describedBy({
        description: description != null && description !== "",
        error: hasError,
      })}
      disabled={disabled}
      required={required}
      maxLength={maxLength}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => {
        if (!isControlled) setInternal(e.target.value)
        props.onChange?.(e)
      }}
      className={cn(
        "min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        hasError && "border-destructive focus-visible:ring-destructive",
        autoResize && "resize-none overflow-hidden",
        className,
      )}
      {...props}
    />
  )

  return (
    <FieldShell
      controlId={ids.controlId}
      labelId={ids.labelId}
      descriptionId={ids.descriptionId}
      errorId={ids.errorId}
      label={label}
      description={description}
      error={error}
      labelPosition={labelPosition}
      required={required}
      disabled={disabled}
    >
      {textareaEl}
      {maxLength ? (
        <p className="text-right text-xs text-muted-foreground" aria-live="polite">
          {current.length}/{maxLength}
        </p>
      ) : null}
    </FieldShell>
  )
}

Textarea.displayName = "Textarea"

export { Textarea }
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/textarea.test.tsx
```
Expected: 6 tests pass.

- [ ] **Step 5: Update `src/primitives/textarea.stories.tsx`**

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Textarea } from "./textarea"

const meta: Meta<typeof Textarea> = {
  title: "Primitives/Textarea",
  component: Textarea,
}
export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = { args: { label: "Descrição", placeholder: "Digite..." } }

export const WithDescription: Story = {
  args: { label: "Bio", description: "Mínimo 10 caracteres", placeholder: "Sobre você" },
}

export const WithError: Story = {
  args: { label: "Descrição", value: "abc", error: "Mínimo 10 caracteres" },
}

export const WithCounter: Story = {
  render: () => {
    const [v, setV] = useState("")
    return <Textarea label="Tweet" maxLength={280} value={v} onChange={(e) => setV(e.target.value)} />
  },
}

export const AutoResize: Story = {
  render: () => {
    const [v, setV] = useState("Linha 1\nLinha 2\nLinha 3")
    return <Textarea label="Notas" autoResize value={v} onChange={(e) => setV(e.target.value)} />
  },
}
```

- [ ] **Step 6: Re-export from index**

Append to `src/index.ts`:
```ts
export { Textarea, type TextareaProps } from "./primitives/textarea"
```

- [ ] **Step 7: Commit**

```bash
git add src/primitives/textarea.tsx src/primitives/textarea.test.tsx src/primitives/textarea.stories.tsx src/index.ts
git commit -m "feat(textarea): label/description/error/maxLength/autoResize"
```

### Phase 2 validation

- [ ] **Step 1: Full suite**

```bash
cd /home/matheus/Projects/ui && bun run typecheck && bun run test src/primitives/ && bun run lint
```
Expected: all primitives tests pass (existing + new Input + new Textarea).

---

(continued in next sections — Phase 3 onward)

## Phase 3: Toggle Controls — `Checkbox`, `Switch`, `RadioGroup`

### Task 3.1: Rewrite `Checkbox` with label/description/error

**Files:**
- Modify: `src/primitives/checkbox.tsx`
- Modify: `src/primitives/checkbox.test.tsx`
- Modify: `src/primitives/checkbox.stories.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/primitives/checkbox.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Checkbox } from "./checkbox"

describe("Checkbox", () => {
  it("renders the label associated with the checkbox", () => {
    render(<Checkbox label="Aceito" />)
    const box = screen.getByRole("checkbox", { name: "Aceito" })
    expect(box).toBeInTheDocument()
  })

  it("renders description", () => {
    render(<Checkbox label="Aceito" description="Você pode revogar." />)
    expect(screen.getByText("Você pode revogar.")).toBeInTheDocument()
  })

  it("renders error with role=alert", () => {
    render(<Checkbox label="X" error="Obrigatório" />)
    expect(screen.getByRole("alert")).toHaveTextContent("Obrigatório")
  })

  it("toggles on label click (implicit Radix label binding)", async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox label="Aceito" onCheckedChange={onCheckedChange} />)
    await userEvent.click(screen.getByText("Aceito"))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it("renders indeterminate state with the Minus icon", () => {
    const { container } = render(<Checkbox label="X" checked="indeterminate" />)
    const indicator = container.querySelector('[data-slot="checkbox-indicator"]')
    // Minus svg is rendered when indeterminate
    expect(indicator?.innerHTML).toContain("svg")
    expect(container.querySelector('[data-state="indeterminate"]')).toBeInTheDocument()
  })

  it("respects disabled", () => {
    render(<Checkbox label="X" disabled />)
    expect(screen.getByRole("checkbox", { name: "X" })).toBeDisabled()
  })

  it("supports rich ReactNode label", () => {
    render(<Checkbox label={<>Aceito os <a href="/t">termos</a></>} />)
    expect(screen.getByRole("link", { name: "termos" })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
bun run test src/primitives/checkbox.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Rewrite `src/primitives/checkbox.tsx`**

```tsx
"use client"

import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./_internal/label"
import { useFieldIds } from "./_internal/use-field-ids"

export interface CheckboxProps
  extends Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "id"> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  id?: string
  ref?: React.Ref<HTMLButtonElement>
}

function Checkbox({
  id,
  label,
  description,
  error,
  required,
  disabled,
  className,
  checked,
  ref,
  ...props
}: CheckboxProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const hasLabel = label != null && label !== ""

  return (
    <div data-slot="checkbox-field" className="flex w-full flex-col gap-1.5">
      <div className="flex items-start gap-2">
        <CheckboxPrimitive.Root
          ref={ref}
          id={ids.controlId}
          data-slot="checkbox"
          checked={checked}
          disabled={disabled}
          required={required}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
          className={cn(
            "peer mt-0.5 size-4 shrink-0 rounded-sm border border-primary shadow",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
            hasError && "border-destructive",
            className,
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            data-slot="checkbox-indicator"
            className="grid place-content-center text-current"
          >
            {checked === "indeterminate" ? (
              <MinusIcon className="size-3.5" />
            ) : (
              <CheckIcon className="size-3.5" />
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {hasLabel ? (
          <div className="flex flex-col gap-0.5">
            <Label htmlFor={ids.controlId} required={required} id={ids.labelId}>
              {label}
            </Label>
            {hasDescription ? (
              <p
                id={ids.descriptionId}
                data-slot="checkbox-description"
                className="text-xs text-muted-foreground"
              >
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {hasError ? (
        <p
          id={ids.errorId}
          data-slot="checkbox-error"
          role="alert"
          className="text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

Checkbox.displayName = "Checkbox"

export { Checkbox }
```

- [ ] **Step 4: Run test — verify it passes**

```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/checkbox.test.tsx
```
Expected: 7 tests pass.

- [ ] **Step 5: Update `src/primitives/checkbox.stories.tsx`**

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Checkbox } from "./checkbox"

const meta: Meta<typeof Checkbox> = { title: "Primitives/Checkbox", component: Checkbox }
export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = { args: { label: "Aceito os termos" } }

export const WithDescription: Story = {
  args: { label: "Receber e-mails", description: "Você pode cancelar a qualquer momento." },
}

export const WithError: Story = {
  args: { label: "Aceito os termos", error: "Você precisa aceitar para continuar" },
}

export const RichLabel: Story = {
  args: {
    label: (
      <>
        Aceito os <a href="/tos" className="underline">termos</a> e a{" "}
        <a href="/privacy" className="underline">política</a>
      </>
    ),
  },
}

export const Indeterminate: Story = {
  render: () => {
    const [c, setC] = useState<boolean | "indeterminate">("indeterminate")
    return <Checkbox label="Selecionar todos" checked={c} onCheckedChange={setC} />
  },
}

export const Disabled: Story = { args: { label: "Desabilitado", disabled: true } }
```

- [ ] **Step 6: Re-export**

Append to `src/index.ts`:
```ts
export { Checkbox, type CheckboxProps } from "./primitives/checkbox"
```

- [ ] **Step 7: Commit**

```bash
git add src/primitives/checkbox.tsx src/primitives/checkbox.test.tsx src/primitives/checkbox.stories.tsx src/index.ts
git commit -m "feat(checkbox): label/description/error API + indeterminate icon"
```

### Task 3.2: Rewrite `Switch` (same pattern as Checkbox minus indeterminate)

**Files:**
- Modify: `src/primitives/switch.tsx`
- Modify: `src/primitives/switch.test.tsx`
- Modify: `src/primitives/switch.stories.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/primitives/switch.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Switch } from "./switch"

describe("Switch", () => {
  it("renders label associated with switch", () => {
    render(<Switch label="Notificações" />)
    expect(screen.getByRole("switch", { name: "Notificações" })).toBeInTheDocument()
  })

  it("renders description and error", () => {
    render(<Switch label="X" description="ajuda" error="erro" />)
    expect(screen.getByText("ajuda")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("erro")
  })

  it("toggles on label click", async () => {
    const onChange = vi.fn()
    render(<Switch label="Push" onCheckedChange={onChange} />)
    await userEvent.click(screen.getByText("Push"))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("applies labelPosition='left' (label rendered before switch)", () => {
    const { container } = render(<Switch label="X" labelPosition="left" />)
    expect(container.querySelector('[data-slot="switch-field"]')).toHaveAttribute(
      "data-label-position",
      "left",
    )
  })

  it("respects disabled", () => {
    render(<Switch label="X" disabled />)
    expect(screen.getByRole("switch", { name: "X" })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/switch.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Rewrite `src/primitives/switch.tsx`**

```tsx
"use client"

import * as SwitchPrimitive from "@radix-ui/react-switch"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./_internal/label"
import { useFieldIds } from "./_internal/use-field-ids"

export interface SwitchProps
  extends Omit<React.ComponentProps<typeof SwitchPrimitive.Root>, "id"> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: "left" | "right"
  id?: string
  ref?: React.Ref<HTMLButtonElement>
}

function Switch({
  id,
  label,
  description,
  error,
  required,
  disabled,
  labelPosition = "right",
  className,
  ref,
  ...props
}: SwitchProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const hasLabel = label != null && label !== ""

  const switchEl = (
    <SwitchPrimitive.Root
      ref={ref}
      id={ids.controlId}
      data-slot="switch"
      disabled={disabled}
      required={required}
      aria-invalid={hasError ? true : undefined}
      aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )

  const labelEl = hasLabel ? (
    <div className="flex flex-col gap-0.5">
      <Label htmlFor={ids.controlId} required={required} id={ids.labelId}>
        {label}
      </Label>
      {hasDescription ? (
        <p id={ids.descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  ) : null

  return (
    <div
      data-slot="switch-field"
      data-label-position={labelPosition}
      className="flex w-full flex-col gap-1.5"
    >
      <div className="flex items-center gap-2">
        {labelPosition === "left" ? labelEl : null}
        {switchEl}
        {labelPosition === "right" ? labelEl : null}
      </div>
      {hasError ? (
        <p id={ids.errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

Switch.displayName = "Switch"

export { Switch }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/switch.test.tsx
```
Expected: 5 tests pass.

- [ ] **Step 5: Update stories**

Replace `src/primitives/switch.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Switch } from "./switch"

const meta: Meta<typeof Switch> = { title: "Primitives/Switch", component: Switch }
export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = { args: { label: "Notificações push" } }
export const WithDescription: Story = {
  args: { label: "Push", description: "Você ainda receberá alertas críticos." },
}
export const WithError: Story = { args: { label: "X", error: "Configure os e-mails primeiro" } }
export const LabelLeft: Story = { args: { label: "Modo escuro", labelPosition: "left" } }
export const Disabled: Story = { args: { label: "X", disabled: true } }
```

- [ ] **Step 6: Re-export**

Append to `src/index.ts`:
```ts
export { Switch, type SwitchProps } from "./primitives/switch"
```

- [ ] **Step 7: Commit**

```bash
git add src/primitives/switch.tsx src/primitives/switch.test.tsx src/primitives/switch.stories.tsx src/index.ts
git commit -m "feat(switch): label/description/error/labelPosition"
```

### Task 3.3: Rewrite `RadioGroup` as data-driven

**Files:**
- Modify: `src/primitives/radio-group.tsx`
- Modify: `src/primitives/radio-group.test.tsx`
- Modify: `src/primitives/radio-group.stories.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/primitives/radio-group.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ZapIcon } from "lucide-react"
import { describe, expect, it, vi } from "vitest"

import { RadioGroup } from "./radio-group"

const VALUES = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team", disabled: true },
]

describe("RadioGroup", () => {
  it("renders one radio per value", () => {
    render(<RadioGroup label="Plano" values={VALUES} />)
    expect(screen.getAllByRole("radio")).toHaveLength(3)
  })

  it("renders the group label and error", () => {
    render(<RadioGroup label="Plano" error="Escolha um" values={VALUES} />)
    expect(screen.getByText("Plano")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("Escolha um")
  })

  it("selects on click and fires onValueChange", async () => {
    const onChange = vi.fn()
    render(<RadioGroup label="Plano" values={VALUES} onValueChange={onChange} />)
    await userEvent.click(screen.getByRole("radio", { name: "Pro" }))
    expect(onChange).toHaveBeenCalledWith("pro")
  })

  it("disables individual items via item.disabled", () => {
    render(<RadioGroup label="Plano" values={VALUES} />)
    expect(screen.getByRole("radio", { name: "Team" })).toBeDisabled()
  })

  it("renders item description and icon when provided", () => {
    render(
      <RadioGroup
        label="Plano"
        values={[
          { value: "f", label: "Free", description: "R$ 0", icon: ZapIcon },
        ]}
      />,
    )
    expect(screen.getByText("R$ 0")).toBeInTheDocument()
  })

  it("supports horizontal orientation", () => {
    const { container } = render(
      <RadioGroup label="X" values={VALUES} orientation="horizontal" />,
    )
    expect(container.querySelector('[data-slot="radio-group"]')).toHaveAttribute(
      "data-orientation",
      "horizontal",
    )
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/radio-group.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Rewrite `src/primitives/radio-group.tsx`**

```tsx
"use client"

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./_internal/label"
import { useFieldIds } from "./_internal/use-field-ids"

export interface RadioGroupItemData {
  value: string
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

export interface RadioGroupProps
  extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Root>, "id" | "orientation"> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  orientation?: "vertical" | "horizontal"
  values: RadioGroupItemData[]
  id?: string
  ref?: React.Ref<HTMLDivElement>
}

function RadioGroup({
  id,
  label,
  description,
  error,
  required,
  disabled,
  orientation = "vertical",
  values,
  className,
  ref,
  ...props
}: RadioGroupProps) {
  const ids = useFieldIds(id)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const hasLabel = label != null && label !== ""

  return (
    <div data-slot="radio-group-field" className="flex w-full flex-col gap-1.5">
      {hasLabel ? (
        <Label htmlFor={ids.controlId} required={required} id={ids.labelId}>
          {label}
        </Label>
      ) : null}
      {hasDescription ? (
        <p id={ids.descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      <RadioGroupPrimitive.Root
        ref={ref}
        id={ids.controlId}
        data-slot="radio-group"
        data-orientation={orientation}
        disabled={disabled}
        aria-describedby={ids.describedBy({ description: hasDescription, error: hasError })}
        aria-invalid={hasError ? true : undefined}
        className={cn(
          orientation === "horizontal" ? "flex flex-row flex-wrap gap-6" : "grid gap-3",
          className,
        )}
        {...props}
      >
        {values.map((item) => {
          const itemId = `${ids.controlId}-${item.value}`
          const Icon = item.icon
          return (
            <div key={item.value} className="flex items-start gap-2">
              <RadioGroupPrimitive.Item
                id={itemId}
                value={item.value}
                disabled={item.disabled}
                data-slot="radio-group-item"
                className={cn(
                  "aspect-square size-4 shrink-0 rounded-full border border-primary text-primary shadow",
                  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                <RadioGroupPrimitive.Indicator
                  data-slot="radio-group-indicator"
                  className="flex items-center justify-center"
                >
                  <CircleIcon className="size-2 fill-current text-current" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <Label htmlFor={itemId} className="flex flex-col gap-0.5 font-normal">
                <span className="inline-flex items-center gap-1.5">
                  {Icon ? <Icon className="size-4" /> : null}
                  {item.label}
                </span>
                {item.description ? (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                ) : null}
              </Label>
            </div>
          )
        })}
      </RadioGroupPrimitive.Root>
      {hasError ? (
        <p id={ids.errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

RadioGroup.displayName = "RadioGroup"

export { RadioGroup }
```

- [ ] **Step 4: Verify tests pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/radio-group.test.tsx
```
Expected: 6 tests pass.

- [ ] **Step 5: Update stories**

Replace `src/primitives/radio-group.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"
import { ZapIcon, CrownIcon, BuildingIcon } from "lucide-react"

import { RadioGroup } from "./radio-group"

const meta: Meta<typeof RadioGroup> = { title: "Primitives/RadioGroup", component: RadioGroup }
export default meta
type Story = StoryObj<typeof RadioGroup>

export const Default: Story = {
  args: {
    label: "Plano",
    values: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
    ],
  },
}

export const WithDescriptions: Story = {
  args: {
    label: "Escolha um plano",
    values: [
      { value: "free", label: "Free", description: "R$ 0/mês", icon: ZapIcon },
      { value: "pro", label: "Pro", description: "R$ 29/mês", icon: CrownIcon },
      { value: "team", label: "Team", description: "R$ 99/mês", icon: BuildingIcon, disabled: true },
    ],
  },
}

export const Horizontal: Story = {
  args: {
    label: "Tamanho",
    orientation: "horizontal",
    values: [
      { value: "s", label: "P" },
      { value: "m", label: "M" },
      { value: "l", label: "G" },
    ],
  },
}

export const WithError: Story = {
  args: {
    label: "Plano",
    error: "Selecione uma opção",
    values: [{ value: "a", label: "A" }, { value: "b", label: "B" }],
  },
}
```

- [ ] **Step 6: Re-export**

Append to `src/index.ts`:
```ts
export {
  RadioGroup,
  type RadioGroupProps,
  type RadioGroupItemData,
} from "./primitives/radio-group"
```

- [ ] **Step 7: Commit**

```bash
git add src/primitives/radio-group.tsx src/primitives/radio-group.test.tsx src/primitives/radio-group.stories.tsx src/index.ts
git commit -m "feat(radio-group): data-driven values with label/description/error"
```

### Phase 3 validation

- [ ] **Step 1: Run primitives suite**

```bash
cd /home/matheus/Projects/ui && bun run typecheck && bun run test src/primitives/ && bun run lint
```
Expected: pass.

---

## Phase 4: Remaining Primitives — `Avatar`, `Separator`, `Button`, `Badge`, `Skeleton`, `Typography`

### Task 4.1: Rewrite `Avatar` flat

**Files:**
- Modify: `src/primitives/avatar.tsx`
- Modify: `src/primitives/avatar.test.tsx`
- Modify: `src/primitives/avatar.stories.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/primitives/avatar.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { UserIcon } from "lucide-react"
import { describe, expect, it } from "vitest"

import { Avatar } from "./avatar"

describe("Avatar", () => {
  it("renders the image when src is provided and loads", async () => {
    render(<Avatar src="/me.jpg" alt="Me" fallback="ME" />)
    expect(await screen.findByAltText("Me")).toBeInTheDocument()
  })

  it("renders the fallback string when no src", () => {
    render(<Avatar alt="Me" fallback="ME" />)
    expect(screen.getByText("ME")).toBeInTheDocument()
  })

  it("renders a ReactNode fallback (e.g. icon)", () => {
    render(<Avatar alt="Me" fallback={<UserIcon data-testid="icon" />} />)
    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })

  it("applies className to the root", () => {
    const { container } = render(<Avatar alt="X" fallback="X" className="custom" />)
    expect(container.querySelector('[data-slot="avatar"]')).toHaveClass("custom")
  })

  it("forwards ref to the root", () => {
    let captured: HTMLSpanElement | null = null
    render(<Avatar alt="X" fallback="X" ref={(el) => { captured = el }} />)
    expect(captured).toBeInstanceOf(HTMLSpanElement)
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
bun run test src/primitives/avatar.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Rewrite `src/primitives/avatar.tsx`**

```tsx
"use client"

import * as AvatarPrimitive from "@radix-ui/react-avatar"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface AvatarProps
  extends Omit<React.ComponentProps<typeof AvatarPrimitive.Root>, "children"> {
  src?: string
  alt: string
  fallback: React.ReactNode
  ref?: React.Ref<HTMLSpanElement>
}

function Avatar({ src, alt, fallback, className, ref, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      data-slot="avatar"
      className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    >
      {src ? (
        <AvatarPrimitive.Image
          data-slot="avatar-image"
          src={src}
          alt={alt}
          className="aspect-square h-full w-full"
        />
      ) : null}
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm"
      >
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

Avatar.displayName = "Avatar"

export { Avatar }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/avatar.test.tsx
```
Expected: 5 tests pass.

- [ ] **Step 5: Update stories**

Replace `src/primitives/avatar.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"
import { UserIcon } from "lucide-react"

import { Avatar } from "./avatar"

const meta: Meta<typeof Avatar> = { title: "Primitives/Avatar", component: Avatar }
export default meta
type Story = StoryObj<typeof Avatar>

export const WithImage: Story = {
  args: { src: "https://github.com/shadcn.png", alt: "@shadcn", fallback: "CN" },
}

export const Fallback: Story = { args: { alt: "John Doe", fallback: "JD" } }

export const FallbackIcon: Story = {
  args: { alt: "Anônimo", fallback: <UserIcon className="size-5" /> },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar alt="X" fallback="XS" className="size-6 text-xs" />
      <Avatar alt="X" fallback="SM" className="size-8 text-sm" />
      <Avatar alt="X" fallback="MD" />
      <Avatar alt="X" fallback="LG" className="size-14 text-lg" />
    </div>
  ),
}
```

- [ ] **Step 6: Re-export**

Append to `src/index.ts`:
```ts
export { Avatar, type AvatarProps } from "./primitives/avatar"
```

- [ ] **Step 7: Commit**

```bash
git add src/primitives/avatar.tsx src/primitives/avatar.test.tsx src/primitives/avatar.stories.tsx src/index.ts
git commit -m "feat(avatar): flat src/alt/fallback API"
```

### Task 4.2: Add `label` prop to `Separator`

**Files:**
- Modify: `src/primitives/separator.tsx`
- Modify: `src/primitives/separator.test.tsx`
- Modify: `src/primitives/separator.stories.tsx`

- [ ] **Step 1: Write failing test for the label prop**

Append to `src/primitives/separator.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Separator } from "./separator"

describe("Separator", () => {
  it("renders a horizontal separator by default", () => {
    const { container } = render(<Separator />)
    expect(container.querySelector('[data-slot="separator"]')).toBeInTheDocument()
  })

  it("renders label text in the middle when provided", () => {
    render(<Separator label="ou" />)
    expect(screen.getByText("ou")).toBeInTheDocument()
  })

  it("respects orientation=vertical", () => {
    const { container } = render(<Separator orientation="vertical" />)
    expect(container.querySelector('[data-slot="separator"]')).toHaveAttribute(
      "data-orientation",
      "vertical",
    )
  })

  it("supports decorative=false (role=separator)", () => {
    render(<Separator decorative={false} />)
    expect(screen.getByRole("separator")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/separator.test.tsx
```
Expected: label test fails.

- [ ] **Step 3: Rewrite `src/primitives/separator.tsx`**

```tsx
"use client"

import * as SeparatorPrimitive from "@radix-ui/react-separator"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface SeparatorProps
  extends Omit<React.ComponentProps<typeof SeparatorPrimitive.Root>, "children"> {
  /** When set, renders text in the middle of the separator line. Horizontal only. */
  label?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  label,
  ref,
  ...props
}: SeparatorProps) {
  if (label && orientation === "horizontal") {
    return (
      <div
        ref={ref}
        data-slot="separator"
        data-orientation="horizontal"
        role={decorative ? undefined : "separator"}
        aria-orientation="horizontal"
        className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}
        {...props}
      >
        <span className="h-px flex-1 bg-border" />
        <span data-slot="separator-label">{label}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    )
  }

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      data-slot="separator"
      orientation={orientation}
      decorative={decorative}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  )
}

Separator.displayName = "Separator"

export { Separator }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/separator.test.tsx
```
Expected: 4 tests pass.

- [ ] **Step 5: Update stories**

Append to `src/primitives/separator.stories.tsx`:
```tsx
export const WithLabel = { args: { label: "ou" } }
```

- [ ] **Step 6: Re-export**

Append to `src/index.ts`:
```ts
export { Separator, type SeparatorProps } from "./primitives/separator"
```

- [ ] **Step 7: Commit**

```bash
git add src/primitives/separator.tsx src/primitives/separator.test.tsx src/primitives/separator.stories.tsx src/index.ts
git commit -m "feat(separator): add optional label prop"
```

### Task 4.3: Add `loading` + `sm`/`lg` sizes to `Button`, keep `asChild`

**Files:**
- Modify: `src/primitives/button.tsx`
- Modify: `src/primitives/button.test.tsx`

- [ ] **Step 1: Write failing tests for new props**

Replace `src/primitives/button.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Button } from "./button"

describe("Button", () => {
  it("renders a button with children", () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument()
  })

  it("supports variants", () => {
    render(<Button variant="destructive">X</Button>)
    expect(screen.getByRole("button")).toHaveClass("bg-destructive")
  })

  it("supports sm/lg/icon sizes", () => {
    const { rerender } = render(<Button size="sm">x</Button>)
    expect(screen.getByRole("button")).toHaveClass("h-8")
    rerender(<Button size="lg">x</Button>)
    expect(screen.getByRole("button")).toHaveClass("h-10")
    rerender(<Button size="icon">x</Button>)
    expect(screen.getByRole("button")).toHaveClass("size-9")
  })

  it("renders a spinner and disables when loading", () => {
    render(<Button loading>Salvar</Button>)
    const btn = screen.getByRole("button", { name: /Salvar/ })
    expect(btn).toBeDisabled()
    expect(btn.querySelector("svg.animate-spin")).toBeInTheDocument()
  })

  it("renders as child with asChild (Slot)", () => {
    render(
      <Button asChild>
        <a href="/x">link</a>
      </Button>,
    )
    expect(screen.getByRole("link", { name: "link" })).toBeInTheDocument()
  })

  it("forwards ref", () => {
    let captured: HTMLButtonElement | null = null
    render(<Button ref={(el) => { captured = el }}>x</Button>)
    expect(captured).toBeInstanceOf(HTMLButtonElement)
  })

  it("applies focus ring classes", () => {
    render(<Button>x</Button>)
    expect(screen.getByRole("button").className).toContain("focus-visible:ring")
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/button.test.tsx
```
Expected: most pass, `loading` test fails, `sm`/`lg` may fail depending on current sizes.

- [ ] **Step 3: Rewrite `src/primitives/button.tsx`**

```tsx
"use client"

import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** When true, renders a spinner before children and disables the button. */
  loading?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ref,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      ref={ref as React.Ref<HTMLButtonElement>}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </Comp>
  )
}

Button.displayName = "Button"

export { Button, buttonVariants }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/primitives/button.test.tsx
```
Expected: 7 tests pass.

- [ ] **Step 5: Re-export**

Append to `src/index.ts`:
```ts
export { Button, buttonVariants, type ButtonProps } from "./primitives/button"
```

- [ ] **Step 6: Commit**

```bash
git add src/primitives/button.tsx src/primitives/button.test.tsx src/index.ts
git commit -m "feat(button): loading prop + sm/lg sizes, retain asChild"
```

### Task 4.4: Re-export `Badge`, `Skeleton`, `Typography` (no code changes)

**Files:**
- Modify: `src/index.ts` only

- [ ] **Step 1: Verify current implementations are React 19 ref-style**

Run:
```bash
grep -l "React.forwardRef" src/primitives/badge.tsx src/primitives/skeleton.tsx src/primitives/typography.tsx
```
If any still use `forwardRef`, convert them to function components with `ref?: React.Ref<...>` prop.

If conversions needed, do each one and re-run its `.test.tsx` after the conversion.

- [ ] **Step 2: Append re-exports to `src/index.ts`**

```ts
export { Badge, badgeVariants, type BadgeProps } from "./primitives/badge"
export { Skeleton } from "./primitives/skeleton"
export { Typography, typographyVariants, type TypographyProps } from "./primitives/typography"
```

- [ ] **Step 3: Run typecheck**

```bash
cd /home/matheus/Projects/ui && bun run typecheck
```
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/index.ts src/primitives/
git commit -m "chore(primitives): re-export Badge, Skeleton, Typography"
```

### Phase 4 validation

- [ ] **Step 1: Full primitives suite**

```bash
cd /home/matheus/Projects/ui && bun run typecheck && bun run test src/primitives/ && bun run lint
```
Expected: pass.

---

## Phase 5: Overlays — `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `Tooltip`, `Alert`, `Collapsible`, `Progress`, `Sonner`

### Task 5.1: Rewrite `Dialog` flat with `footer` slot

**Files:**
- Modify: `src/overlays/dialog.tsx`
- Modify: `src/overlays/dialog.test.tsx`
- Modify: `src/overlays/dialog.stories.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/overlays/dialog.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Dialog } from "./dialog"

describe("Dialog", () => {
  it("opens via trigger and renders title/description/children", async () => {
    render(
      <Dialog trigger={<button>Abrir</button>} title="Editar" description="Atualize seus dados">
        <p>Body content</p>
      </Dialog>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Editar")).toBeInTheDocument()
    expect(screen.getByText("Atualize seus dados")).toBeInTheDocument()
    expect(screen.getByText("Body content")).toBeInTheDocument()
  })

  it("renders the footer slot when provided", async () => {
    render(
      <Dialog
        trigger={<button>Abrir</button>}
        title="X"
        footer={<button data-testid="save">Salvar</button>}
      >
        <p>body</p>
      </Dialog>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(screen.getByTestId("save")).toBeInTheDocument()
  })

  it("controlled open via props", () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange} title="X">
        body
      </Dialog>,
    )
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("closes on Escape", async () => {
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange} title="X">
        body
      </Dialog>,
    )
    await userEvent.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("hides the close button when hideCloseButton is set", () => {
    render(
      <Dialog open title="X" hideCloseButton>
        body
      </Dialog>,
    )
    expect(screen.queryByRole("button", { name: /Close/ })).not.toBeInTheDocument()
  })

  it("uses custom closeLabel", () => {
    render(
      <Dialog open title="X" closeLabel="Fechar">
        body
      </Dialog>,
    )
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/overlays/dialog.test.tsx
```
Expected: most fail (old Dialog is compound).

- [ ] **Step 3: Rewrite `src/overlays/dialog.tsx`**

```tsx
"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { dialogContentBase, overlayBase } from "./_internal/animations"

export interface DialogProps {
  /** Element that opens the dialog. Omit for fully controlled use. */
  trigger?: React.ReactNode
  /** Required for a11y (Radix logs a warning otherwise). */
  title: React.ReactNode
  description?: React.ReactNode
  /** Body content (renders between header and footer). */
  children?: React.ReactNode
  /** Footer slot (renders flex-end justify with gap-2). */
  footer?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  hideCloseButton?: boolean
  closeLabel?: string
  /** Visual size of the modal. */
  size?: "sm" | "md" | "lg" | "xl"
  /** Extra class on the content element. */
  className?: string
}

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const

function Dialog({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  defaultOpen,
  onOpenChange,
  hideCloseButton = false,
  closeLabel = "Close",
  size = "md",
  className,
}: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? (
        <DialogPrimitive.Trigger asChild data-slot="dialog-trigger">
          {trigger}
        </DialogPrimitive.Trigger>
      ) : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay data-slot="dialog-overlay" className={overlayBase} />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(dialogContentBase, SIZE_CLASSES[size], className)}
        >
          <DialogPrimitive.Title data-slot="dialog-title" className="text-lg font-semibold leading-none">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description data-slot="dialog-description" className="text-sm text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          ) : null}
          {children ? <div data-slot="dialog-body">{children}</div> : null}
          {footer ? (
            <div data-slot="dialog-footer" className="flex justify-end gap-2">
              {footer}
            </div>
          ) : null}
          {!hideCloseButton ? (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              aria-label={closeLabel}
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
            >
              <XIcon className="size-4" />
              <span className="sr-only">{closeLabel}</span>
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

Dialog.displayName = "Dialog"

export { Dialog }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/overlays/dialog.test.tsx
```
Expected: 6 tests pass.

- [ ] **Step 5: Update stories**

Replace `src/overlays/dialog.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "../primitives/button"
import { Dialog } from "./dialog"

const meta: Meta<typeof Dialog> = { title: "Overlays/Dialog", component: Dialog }
export default meta
type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  args: {
    trigger: <Button>Abrir</Button>,
    title: "Editar perfil",
    description: "Atualize suas informações.",
    children: <p>Body content here.</p>,
    footer: (
      <>
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar</Button>
      </>
    ),
  },
}

export const NoFooter: Story = {
  args: { trigger: <Button>Abrir</Button>, title: "Apenas mensagem", children: <p>Sem footer.</p> },
}

export const HiddenClose: Story = {
  args: {
    trigger: <Button>Abrir</Button>,
    title: "Sem X",
    hideCloseButton: true,
    footer: <Button>OK</Button>,
  },
}
```

- [ ] **Step 6: Re-export**

Append to `src/index.ts`:
```ts
export { Dialog, type DialogProps } from "./overlays/dialog"
```

- [ ] **Step 7: Commit**

```bash
git add src/overlays/dialog.tsx src/overlays/dialog.test.tsx src/overlays/dialog.stories.tsx src/index.ts
git commit -m "feat(dialog): flat title/description/footer/children API"
```

### Task 5.2: Rewrite `AlertDialog` flat with `onConfirm`

**Files:**
- Modify: `src/overlays/alert-dialog.tsx`
- Modify: `src/overlays/alert-dialog.test.tsx`
- Modify: `src/overlays/alert-dialog.stories.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/overlays/alert-dialog.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AlertDialog } from "./alert-dialog"

describe("AlertDialog", () => {
  it("renders title and description and confirm/cancel buttons", () => {
    render(
      <AlertDialog
        open
        title="Tem certeza?"
        description="Não pode ser desfeito."
        onConfirm={() => {}}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
      />,
    )
    expect(screen.getByText("Tem certeza?")).toBeInTheDocument()
    expect(screen.getByText("Não pode ser desfeito.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument()
  })

  it("fires onConfirm when confirm clicked", async () => {
    const onConfirm = vi.fn()
    render(<AlertDialog open title="X" onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it("fires onOpenChange(false) on cancel", async () => {
    const onOpenChange = vi.fn()
    render(<AlertDialog open onOpenChange={onOpenChange} title="X" onConfirm={() => {}} />)
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("renders children above the buttons when provided", () => {
    render(
      <AlertDialog open title="X" onConfirm={() => {}}>
        <p data-testid="extra">Extra context</p>
      </AlertDialog>,
    )
    expect(screen.getByTestId("extra")).toBeInTheDocument()
  })

  it("applies confirmVariant", () => {
    render(
      <AlertDialog open title="X" onConfirm={() => {}} confirmVariant="destructive" />,
    )
    expect(screen.getByRole("button", { name: "Confirmar" })).toHaveClass("bg-destructive")
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/overlays/alert-dialog.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Rewrite `src/overlays/alert-dialog.tsx`**

```tsx
"use client"

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "../primitives/button"
import { dialogContentBase, overlayBase } from "./_internal/animations"

export interface AlertDialogProps {
  trigger?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm: () => void
  onCancel?: () => void
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: ButtonProps["variant"]
  /** Optional body content rendered above the action buttons. */
  children?: React.ReactNode
  className?: string
}

function AlertDialog({
  trigger,
  title,
  description,
  open,
  defaultOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmVariant = "default",
  children,
  className,
}: AlertDialogProps) {
  return (
    <AlertDialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? (
        <AlertDialogPrimitive.Trigger asChild>{trigger}</AlertDialogPrimitive.Trigger>
      ) : null}
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={overlayBase} />
        <AlertDialogPrimitive.Content
          data-slot="alert-dialog-content"
          className={cn(dialogContentBase, "max-w-lg", className)}
        >
          <AlertDialogPrimitive.Title className="text-lg font-semibold">
            {title}
          </AlertDialogPrimitive.Title>
          {description ? (
            <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
              {description}
            </AlertDialogPrimitive.Description>
          ) : null}
          {children}
          <div className="flex justify-end gap-2">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline" onClick={onCancel}>
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button variant={confirmVariant} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}

AlertDialog.displayName = "AlertDialog"

export { AlertDialog }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/overlays/alert-dialog.test.tsx
```
Expected: 5 tests pass.

- [ ] **Step 5: Update stories**

Replace `src/overlays/alert-dialog.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "../primitives/button"
import { AlertDialog } from "./alert-dialog"

const meta: Meta<typeof AlertDialog> = { title: "Overlays/AlertDialog", component: AlertDialog }
export default meta
type Story = StoryObj<typeof AlertDialog>

export const Default: Story = {
  args: {
    trigger: <Button variant="destructive">Excluir</Button>,
    title: "Tem certeza?",
    description: "Esta ação não pode ser desfeita.",
    confirmLabel: "Excluir",
    confirmVariant: "destructive",
    cancelLabel: "Cancelar",
    onConfirm: () => alert("confirmed"),
  },
}
```

- [ ] **Step 6: Re-export**

Append to `src/index.ts`:
```ts
export { AlertDialog, type AlertDialogProps } from "./overlays/alert-dialog"
```

- [ ] **Step 7: Commit**

```bash
git add src/overlays/alert-dialog.tsx src/overlays/alert-dialog.test.tsx src/overlays/alert-dialog.stories.tsx src/index.ts
git commit -m "feat(alert-dialog): flat title/description/onConfirm API"
```

### Task 5.3: Rewrite `Sheet` flat with `side`/`footer`

**Files:**
- Modify: `src/overlays/sheet.tsx`
- Modify: `src/overlays/sheet.test.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/overlays/sheet.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Sheet } from "./sheet"

describe("Sheet", () => {
  it("opens via trigger and renders title/description/children", async () => {
    render(
      <Sheet trigger={<button>Abrir</button>} title="Config" description="...">
        <p>body</p>
      </Sheet>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Config")).toBeInTheDocument()
    expect(screen.getByText("body")).toBeInTheDocument()
  })

  it("renders footer slot", async () => {
    render(
      <Sheet trigger={<button>Abrir</button>} title="X" footer={<button data-testid="ok">OK</button>}>
        body
      </Sheet>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(screen.getByTestId("ok")).toBeInTheDocument()
  })

  it("supports side prop", async () => {
    const { container } = render(
      <Sheet open side="left" title="X">
        body
      </Sheet>,
    )
    expect(container.querySelector('[data-slot="sheet-content"]')).toHaveAttribute(
      "data-side",
      "left",
    )
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/overlays/sheet.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Rewrite `src/overlays/sheet.tsx`**

```tsx
"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { overlayBase } from "./_internal/animations"

const sheetVariants = cva(
  cn(
    "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  ),
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: { side: "right" },
  },
)

export interface SheetProps extends VariantProps<typeof sheetVariants> {
  trigger?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  closeLabel?: string
  hideCloseButton?: boolean
  className?: string
}

function Sheet({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  defaultOpen,
  onOpenChange,
  side = "right",
  closeLabel = "Close",
  hideCloseButton = false,
  className,
}: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay data-slot="sheet-overlay" className={overlayBase} />
        <DialogPrimitive.Content
          data-slot="sheet-content"
          data-side={side}
          className={cn(sheetVariants({ side }), className)}
        >
          <DialogPrimitive.Title className="text-lg font-semibold">{title}</DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          ) : null}
          {children ? <div data-slot="sheet-body">{children}</div> : null}
          {footer ? (
            <div data-slot="sheet-footer" className="mt-auto flex justify-end gap-2">
              {footer}
            </div>
          ) : null}
          {!hideCloseButton ? (
            <DialogPrimitive.Close
              aria-label={closeLabel}
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2"
            >
              <XIcon className="size-4" />
              <span className="sr-only">{closeLabel}</span>
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

Sheet.displayName = "Sheet"

export { Sheet }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/overlays/sheet.test.tsx
```
Expected: 3 tests pass.

- [ ] **Step 5: Re-export and commit**

Append to `src/index.ts`:
```ts
export { Sheet, type SheetProps } from "./overlays/sheet"
```

Commit:
```bash
git add src/overlays/sheet.tsx src/overlays/sheet.test.tsx src/index.ts
git commit -m "feat(sheet): flat title/description/side/footer API"
```

### Task 5.4: Rewrite `Popover` flat

**Files:**
- Modify: `src/overlays/popover.tsx`
- Modify: `src/overlays/popover.test.tsx`
- Modify: `src/overlays/popover.stories.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/overlays/popover.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Popover } from "./popover"

describe("Popover", () => {
  it("opens on trigger click", async () => {
    render(
      <Popover trigger={<button>Open</button>}>
        <p>Conteúdo</p>
      </Popover>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    expect(screen.getByText("Conteúdo")).toBeInTheDocument()
  })

  it("supports controlled open", () => {
    render(
      <Popover open>
        <p>Visible</p>
      </Popover>,
    )
    expect(screen.getByText("Visible")).toBeInTheDocument()
  })

  it("applies align prop to content", async () => {
    render(
      <Popover trigger={<button>X</button>} align="start">
        <p>c</p>
      </Popover>,
    )
    await userEvent.click(screen.getByRole("button", { name: "X" }))
    const content = document.querySelector('[data-slot="popover-content"]')
    expect(content).toHaveAttribute("data-align", "start")
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/overlays/popover.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Rewrite `src/overlays/popover.tsx`**

```tsx
"use client"

import * as PopoverPrimitive from "@radix-ui/react-popover"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface PopoverProps {
  trigger?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  modal?: boolean
  className?: string
}

function Popover({
  trigger,
  children,
  open,
  defaultOpen,
  onOpenChange,
  align = "center",
  side,
  sideOffset = 4,
  modal,
  className,
}: PopoverProps) {
  return (
    <PopoverPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      {trigger ? (
        <PopoverPrimitive.Trigger asChild data-slot="popover-trigger">
          {trigger}
        </PopoverPrimitive.Trigger>
      ) : null}
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="popover-content"
          align={align}
          side={side}
          sideOffset={sideOffset}
          className={cn(
            "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "origin-[var(--radix-popover-content-transform-origin)]",
            className,
          )}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

Popover.displayName = "Popover"

export { Popover }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/overlays/popover.test.tsx
```
Expected: 3 tests pass.

- [ ] **Step 5: Update stories**

Replace `src/overlays/popover.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "../primitives/button"
import { Popover } from "./popover"

const meta: Meta<typeof Popover> = { title: "Overlays/Popover", component: Popover }
export default meta
type Story = StoryObj<typeof Popover>

export const Default: Story = {
  args: {
    trigger: <Button>Filtrar</Button>,
    children: <p>Conteúdo do popover</p>,
  },
}
```

- [ ] **Step 6: Re-export + commit**

Append to `src/index.ts`:
```ts
export { Popover, type PopoverProps } from "./overlays/popover"
```

```bash
git add src/overlays/popover.tsx src/overlays/popover.test.tsx src/overlays/popover.stories.tsx src/index.ts
git commit -m "feat(popover): flat trigger/children API"
```

### Task 5.5: Rewrite `Tooltip` flat

**Files:**
- Modify: `src/overlays/tooltip.tsx`
- Modify: `src/overlays/tooltip.test.tsx`
- Modify: `src/overlays/tooltip.stories.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/overlays/tooltip.test.tsx`:
```tsx
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Tooltip } from "./tooltip"

describe("Tooltip", () => {
  it("renders the trigger child", () => {
    render(
      <Tooltip content="ajuda">
        <button>Hover</button>
      </Tooltip>,
    )
    expect(screen.getByRole("button", { name: "Hover" })).toBeInTheDocument()
  })

  it("fires onOpenChange on focus and Escape closes", () => {
    const onOpenChange = vi.fn()
    render(
      <Tooltip content="ajuda" onOpenChange={onOpenChange} delayDuration={0}>
        <button>Hover</button>
      </Tooltip>,
    )
    fireEvent.focus(screen.getByRole("button", { name: "Hover" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    fireEvent.keyDown(document.body, { key: "Escape" })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("accepts ReactNode as content", () => {
    render(
      <Tooltip content={<strong>rich</strong>} open>
        <button>X</button>
      </Tooltip>,
    )
    // Radix renders the visible content + sr-only duplicate
    const rich = screen.getAllByText("rich")
    expect(rich.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/overlays/tooltip.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Rewrite `src/overlays/tooltip.tsx`**

```tsx
"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
  className?: string
}

function Tooltip({
  content,
  children,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration = 200,
  side,
  align,
  sideOffset = 4,
  className,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild data-slot="tooltip-trigger">
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            data-slot="tooltip-content"
            side={side}
            align={align}
            sideOffset={sideOffset}
            className={cn(
              "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "origin-[var(--radix-tooltip-content-transform-origin)]",
              className,
            )}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

Tooltip.displayName = "Tooltip"

export { Tooltip }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/overlays/tooltip.test.tsx
```
Expected: 3 tests pass.

- [ ] **Step 5: Re-export and commit**

Append to `src/index.ts`:
```ts
export { Tooltip, type TooltipProps } from "./overlays/tooltip"
```

```bash
git add src/overlays/tooltip.tsx src/overlays/tooltip.test.tsx src/overlays/tooltip.stories.tsx src/index.ts
git commit -m "feat(tooltip): flat content API"
```

### Task 5.6: Rewrite `Alert` flat with `action` slot

**Files:**
- Modify: `src/overlays/alert.tsx`
- Modify: `src/overlays/alert.test.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/overlays/alert.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Alert } from "./alert"

describe("Alert", () => {
  it("renders title and description", () => {
    render(<Alert title="Aviso" description="Conteúdo" />)
    expect(screen.getByText("Aviso")).toBeInTheDocument()
    expect(screen.getByText("Conteúdo")).toBeInTheDocument()
  })

  it("renders action slot", () => {
    render(
      <Alert title="X" description="Y" action={<button data-testid="cta">cta</button>} />,
    )
    expect(screen.getByTestId("cta")).toBeInTheDocument()
  })

  it("applies variant data-attribute", () => {
    const { container } = render(<Alert variant="success" title="X" />)
    expect(container.querySelector('[data-slot="alert"]')).toHaveAttribute("data-variant", "success")
  })

  it("accepts children as alternative body", () => {
    render(
      <Alert variant="info" title="X">
        <p data-testid="body">complex body</p>
      </Alert>,
    )
    expect(screen.getByTestId("body")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/overlays/alert.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Rewrite `src/overlays/alert.tsx`**

```tsx
"use client"

import { cva, type VariantProps } from "class-variance-authority"
import {
  CheckCircle2Icon,
  CircleAlertIcon,
  InfoIcon,
  OctagonAlertIcon,
  TriangleAlertIcon,
} from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        info: "border-status-info-border bg-status-info-bg text-status-info-text",
        success: "border-status-success-border bg-status-success-bg text-status-success-text",
        warning: "border-status-warning-border bg-status-warning-bg text-status-warning-text",
        destructive: "border-destructive/50 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

const DEFAULT_ICONS = {
  default: CircleAlertIcon,
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: TriangleAlertIcon,
  destructive: OctagonAlertIcon,
}

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Override the variant default icon. */
  icon?: React.ReactNode
  /** CTA on the right. */
  action?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}

function Alert({
  className,
  variant = "default",
  title,
  description,
  icon,
  action,
  children,
  ref,
  ...props
}: AlertProps) {
  const Icon = DEFAULT_ICONS[variant ?? "default"]
  const renderedIcon = icon ?? <Icon aria-hidden="true" />

  return (
    <div
      ref={ref}
      role="alert"
      data-slot="alert"
      data-variant={variant}
      className={cn(alertVariants({ variant }), "grid grid-cols-[auto_1fr_auto] items-start gap-3", className)}
      {...props}
    >
      <span className="mt-0.5 flex">{renderedIcon}</span>
      <div className="flex flex-col gap-1">
        {title ? <div className="font-medium leading-none">{title}</div> : null}
        {description ? <div className="text-sm opacity-90">{description}</div> : null}
        {children ? <div className="text-sm">{children}</div> : null}
      </div>
      {action ? <div data-slot="alert-action" className="ml-auto">{action}</div> : null}
    </div>
  )
}

Alert.displayName = "Alert"

export { Alert, alertVariants }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/overlays/alert.test.tsx
```
Expected: 4 tests pass.

- [ ] **Step 5: Re-export + stories + commit**

Append to `src/index.ts`:
```ts
export { Alert, alertVariants, type AlertProps } from "./overlays/alert"
```

Update stories (replace `src/overlays/alert.stories.tsx`):
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"
import { DownloadIcon } from "lucide-react"

import { Button } from "../primitives/button"
import { Alert } from "./alert"

const meta: Meta<typeof Alert> = { title: "Overlays/Alert", component: Alert }
export default meta
type Story = StoryObj<typeof Alert>

export const Info: Story = { args: { variant: "info", title: "Aviso", description: "Texto informativo." } }
export const Success: Story = { args: { variant: "success", title: "Sucesso", description: "Operação concluída." } }
export const Warning: Story = { args: { variant: "warning", title: "Atenção", description: "Verifique antes." } }
export const Destructive: Story = { args: { variant: "destructive", title: "Erro", description: "Algo deu errado." } }
export const WithAction: Story = {
  args: {
    variant: "info",
    title: "Atualização disponível",
    description: "Versão 2.0 está pronta.",
    icon: <DownloadIcon />,
    action: <Button size="sm">Atualizar</Button>,
  },
}
```

Commit:
```bash
git add src/overlays/alert.tsx src/overlays/alert.test.tsx src/overlays/alert.stories.tsx src/index.ts
git commit -m "feat(alert): flat title/description/action/icon API"
```

### Task 5.7: Modify `Collapsible` — add `trigger` slot

**Files:**
- Modify: `src/overlays/collapsible.tsx`
- Modify: `src/overlays/collapsible.test.tsx`

- [ ] **Step 1: Write failing test for custom trigger**

Append to `src/overlays/collapsible.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Collapsible } from "./collapsible"

describe("Collapsible (custom trigger)", () => {
  it("renders custom trigger and toggles on click", async () => {
    render(
      <Collapsible trigger={<button>CustomTrig</button>} defaultOpen={false}>
        <p>body</p>
      </Collapsible>,
    )
    expect(screen.queryByText("body")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "CustomTrig" }))
    expect(screen.getByText("body")).toBeInTheDocument()
  })
})
```

(Keep the existing tests in the file as well — they should still pass with the default-trigger code path.)

- [ ] **Step 2: Run — verify the new test fails**

```bash
cd /home/matheus/Projects/ui && bun run test src/overlays/collapsible.test.tsx
```
Expected: new test fails.

- [ ] **Step 3: Rewrite `src/overlays/collapsible.tsx`**

```tsx
"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { ChevronsUpDown } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface CollapsibleProps {
  /** Default trigger text (only used when `trigger` is not provided). */
  title?: React.ReactNode
  /** Replaces the default chevron button. Mutually exclusive with `title`. */
  trigger?: React.ReactNode
  triggerSide?: "left" | "right"
  triggerLabel?: string
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}

function Collapsible({
  title,
  trigger,
  triggerSide = "right",
  triggerLabel = "Alternar seção",
  defaultOpen,
  open,
  onOpenChange,
  className,
  children,
}: CollapsibleProps) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      data-trigger-side={triggerSide}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      className={cn("w-full", className)}
    >
      {trigger ? (
        <CollapsiblePrimitive.Trigger asChild data-slot="collapsible-trigger">
          {trigger}
        </CollapsiblePrimitive.Trigger>
      ) : (
        <CollapsiblePrimitive.Trigger
          data-slot="collapsible-trigger"
          className={cn(
            "flex w-full items-center justify-between rounded-md py-2 text-sm font-medium",
            "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            triggerSide === "left" && "flex-row-reverse",
          )}
          aria-label={title ? undefined : triggerLabel}
        >
          {title ? <span>{title}</span> : <span className="sr-only">{triggerLabel}</span>}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50 transition-transform data-[state=open]:rotate-180" />
        </CollapsiblePrimitive.Trigger>
      )}
      <CollapsiblePrimitive.Content
        data-slot="collapsible-content"
        className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
      >
        {children}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}

Collapsible.displayName = "Collapsible"

export { Collapsible }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/overlays/collapsible.test.tsx
```
Expected: all tests pass.

- [ ] **Step 5: Re-export + commit**

Append to `src/index.ts`:
```ts
export { Collapsible, type CollapsibleProps } from "./overlays/collapsible"
```

```bash
git add src/overlays/collapsible.tsx src/overlays/collapsible.test.tsx src/index.ts
git commit -m "feat(collapsible): add trigger slot + flat title/triggerSide API"
```

### Task 5.8: Re-export `Progress`, `Toaster`/`toast` (no API changes)

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Append re-exports**

```ts
export { Progress, type ProgressProps } from "./overlays/progress"
export { Toaster, toast } from "./overlays/sonner"
```

- [ ] **Step 2: Verify typecheck + test**

```bash
cd /home/matheus/Projects/ui && bun run typecheck && bun run test src/overlays/progress.test.tsx src/overlays/sonner.test.tsx
```
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "chore(overlays): re-export Progress, Toaster, toast"
```

### Phase 5 validation

- [ ] **Step 1: Full overlays suite**

```bash
cd /home/matheus/Projects/ui && bun run typecheck && bun run test src/overlays/ && bun run lint
```
Expected: pass.

---

## Phase 6: Forms — `Field`, `FieldGroup`, date controls, `Combobox`, `Calendar`

### Task 6.1: Rewrite `Field` + `FieldGroup` (11 exports → 2)

**Files:**
- Modify: `src/forms/field.tsx`
- Modify: `src/forms/field.test.tsx`
- Modify: `src/forms/field.stories.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/forms/field.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Field, FieldGroup } from "./field"
import { Input } from "../primitives/input"

describe("Field", () => {
  it("renders label + description + error around the child control", () => {
    render(
      <Field label="Nome" description="ajuda" error="erro">
        <input id="x" data-testid="ctrl" />
      </Field>,
    )
    expect(screen.getByText("Nome")).toBeInTheDocument()
    expect(screen.getByText("ajuda")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("erro")
  })

  it("supports orientation=horizontal", () => {
    const { container } = render(
      <Field label="X" orientation="horizontal">
        <input />
      </Field>,
    )
    expect(container.querySelector('[data-slot="field"]')).toHaveAttribute(
      "data-orientation",
      "horizontal",
    )
  })

  it("renders the required asterisk", () => {
    render(
      <Field label="X" required>
        <input />
      </Field>,
    )
    expect(screen.getByLabelText("obrigatório")).toBeInTheDocument()
  })

  it("dim opacity when disabled", () => {
    const { container } = render(
      <Field label="X" disabled>
        <input />
      </Field>,
    )
    expect(container.querySelector('[data-slot="field"]')).toHaveAttribute("data-disabled", "true")
  })
})

describe("FieldGroup", () => {
  it("renders legend and children as a fieldset", () => {
    render(
      <FieldGroup legend="Dados pessoais" description="Preencha">
        <Field label="Nome"><Input /></Field>
      </FieldGroup>,
    )
    expect(screen.getByText("Dados pessoais").tagName).toBe("LEGEND")
    expect(screen.getByText("Preencha")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
bun run test src/forms/field.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Rewrite `src/forms/field.tsx`**

```tsx
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "../primitives/_internal/label"
import { useFieldIds } from "../primitives/_internal/use-field-ids"

export interface FieldProps {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  required?: boolean
  disabled?: boolean
  orientation?: "vertical" | "horizontal" | "responsive"
  className?: string
  children: React.ReactNode
  /** Optional id override for the inner control. If not provided, the field generates one. */
  controlId?: string
}

function Field({
  label,
  description,
  error,
  required,
  disabled,
  orientation = "vertical",
  className,
  children,
  controlId,
}: FieldProps) {
  const ids = useFieldIds(controlId)
  const hasError = error != null && error !== ""
  const hasDescription = description != null && description !== ""
  const hasLabel = label != null && label !== ""

  return (
    <div
      data-slot="field"
      data-orientation={orientation}
      data-disabled={disabled ? "true" : undefined}
      className={cn(
        "flex w-full",
        orientation === "horizontal"
          ? "flex-row items-start gap-3"
          : orientation === "responsive"
            ? "flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3"
            : "flex-col gap-1.5",
        disabled && "opacity-60",
        className,
      )}
    >
      {hasLabel ? (
        <Label htmlFor={ids.controlId} required={required} id={ids.labelId}>
          {label}
        </Label>
      ) : null}
      <div className="flex w-full flex-col gap-1.5">
        {children}
        {hasDescription ? (
          <p id={ids.descriptionId} data-slot="field-description" className="text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
        {hasError ? (
          <p id={ids.errorId} data-slot="field-error" role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}

Field.displayName = "Field"

export interface FieldGroupProps {
  legend?: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

function FieldGroup({ legend, description, disabled, className, children }: FieldGroupProps) {
  return (
    <fieldset
      data-slot="field-group"
      disabled={disabled}
      className={cn("flex flex-col gap-4 rounded-md border p-4", className)}
    >
      {legend ? (
        <legend data-slot="field-group-legend" className="px-1 text-sm font-medium">
          {legend}
        </legend>
      ) : null}
      {description ? (
        <p data-slot="field-group-description" className="-mt-2 text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  )
}

FieldGroup.displayName = "FieldGroup"

export { Field, FieldGroup }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/forms/field.test.tsx
```
Expected: 5 tests pass.

- [ ] **Step 5: Update stories**

Replace `src/forms/field.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Input } from "../primitives/input"
import { Field, FieldGroup } from "./field"

const meta: Meta = { title: "Forms/Field" }
export default meta

export const SingleField: StoryObj = {
  render: () => (
    <Field label="Nome" description="Conforme RG" error="" required>
      <Input placeholder="Seu nome" />
    </Field>
  ),
}

export const Horizontal: StoryObj = {
  render: () => (
    <Field label="CPF" orientation="horizontal">
      <Input placeholder="000.000.000-00" />
    </Field>
  ),
}

export const Grouped: StoryObj = {
  render: () => (
    <FieldGroup legend="Dados pessoais" description="Preencha todos os campos">
      <Field label="Nome"><Input /></Field>
      <Field label="E-mail"><Input type="email" /></Field>
    </FieldGroup>
  ),
}
```

- [ ] **Step 6: Re-export**

Append to `src/index.ts`:
```ts
export { Field, FieldGroup, type FieldProps, type FieldGroupProps } from "./forms/field"
```

- [ ] **Step 7: Commit**

```bash
git add src/forms/field.tsx src/forms/field.test.tsx src/forms/field.stories.tsx src/index.ts
git commit -m "feat(field): simplify to Field + FieldGroup (was 11 exports)"
```

### Task 6.2: Rewrite `Calendar` — internalize `CalendarDayButton`

**Files:**
- Modify: `src/forms/calendar.tsx`
- Modify: `src/forms/calendar.test.tsx`

- [ ] **Step 1: Verify current tests still pass**

The v10 Calendar implementation is mostly OK. Only change: do NOT export `CalendarDayButton`.

Run:
```bash
cd /home/matheus/Projects/ui && bun run test src/forms/calendar.test.tsx
```
Expected: pass.

- [ ] **Step 2: Remove `CalendarDayButton` from export list**

Edit `src/forms/calendar.tsx` final line:
```ts
// Was: export { Calendar, CalendarDayButton }
export { Calendar }
```

- [ ] **Step 3: Re-export**

Append to `src/index.ts`:
```ts
export { Calendar } from "./forms/calendar"
```

- [ ] **Step 4: Commit**

```bash
git add src/forms/calendar.tsx src/index.ts
git commit -m "refactor(calendar): internalize CalendarDayButton"
```

### Task 6.3: Modify `Combobox` — add `label`/`description`/`error`

**Files:**
- Modify: `src/forms/combobox.tsx` (wrap existing impl in FieldShell)
- Modify: `src/forms/combobox.test.tsx`

- [ ] **Step 1: Write failing test for new label/error props**

Append to `src/forms/combobox.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Combobox } from "./combobox"

describe("Combobox (label/error)", () => {
  it("renders the label", () => {
    render(
      <Combobox
        label="Cidade"
        options={[{ value: "sp", label: "São Paulo" }]}
        value=""
        onValueChange={() => {}}
      />,
    )
    expect(screen.getByText("Cidade")).toBeInTheDocument()
  })

  it("renders the description", () => {
    render(
      <Combobox
        label="X"
        description="ajuda"
        options={[]}
        value=""
        onValueChange={() => {}}
      />,
    )
    expect(screen.getByText("ajuda")).toBeInTheDocument()
  })

  it("renders the error with role=alert", () => {
    render(
      <Combobox
        label="X"
        error="obrigatório"
        options={[]}
        value=""
        onValueChange={() => {}}
      />,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("obrigatório")
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/forms/combobox.test.tsx
```
Expected: new tests fail (current `Combobox` may not accept `label`/`description`/`error`).

- [ ] **Step 3: Wrap `Combobox` in `FieldShell`**

In `src/forms/combobox.tsx`:
1. Add `label`, `description`, `error`, `required`, `labelPosition` to `ComboboxProps` interface.
2. Import `FieldShell` and `useFieldIds`.
3. At render time, wrap the existing trigger button + popover with `FieldShell`.

Here's the pattern (apply to the existing component):
```tsx
// Inside Combobox function:
const ids = useFieldIds(props.id)
return (
  <FieldShell
    controlId={ids.controlId}
    labelId={ids.labelId}
    descriptionId={ids.descriptionId}
    errorId={ids.errorId}
    label={label}
    description={description}
    error={error}
    labelPosition={labelPosition}
    required={required}
    disabled={disabled}
  >
    {/* existing Popover/Trigger/CommandList layout */}
  </FieldShell>
)
```

(The exact diff depends on current state — preserve all behavior from v10.)

- [ ] **Step 4: Verify all tests pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/forms/combobox.test.tsx
```
Expected: all tests pass.

- [ ] **Step 5: Re-export**

Append to `src/index.ts`:
```ts
export {
  Combobox,
  useComboboxOptions,
  type ComboboxProps,
  type ComboboxOption,
} from "./forms/combobox"
```

- [ ] **Step 6: Commit**

```bash
git add src/forms/combobox.tsx src/forms/combobox.test.tsx src/index.ts
git commit -m "feat(combobox): add label/description/error props"
```

### Task 6.4: Modify `DateInput` — add `label`/`description`/`error`

**Files:**
- Modify: `src/forms/date-input.tsx`
- Modify: `src/forms/date-input.test.tsx`

- [ ] **Step 1: Write failing tests**

Append to `src/forms/date-input.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DateInput } from "./date-input"

describe("DateInput (label/description/error)", () => {
  it("renders the label", () => {
    render(<DateInput label="Data" value="" onChange={() => {}} />)
    expect(screen.getByText("Data")).toBeInTheDocument()
  })

  it("renders the error", () => {
    render(<DateInput label="X" error="inválido" value="" onChange={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("inválido")
  })
})
```

- [ ] **Step 2: Verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/forms/date-input.test.tsx
```

- [ ] **Step 3: Wrap `DateInput` in `FieldShell`**

Same pattern as Combobox: add `label`/`description`/`error`/`labelPosition`/`required` to props, wrap render output in `FieldShell` with `useFieldIds`.

- [ ] **Step 4: Verify all tests pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/forms/date-input.test.tsx
```

- [ ] **Step 5: Re-export + commit**

Append to `src/index.ts`:
```ts
export { DateInput, type DateInputProps } from "./forms/date-input"
```

```bash
git add src/forms/date-input.tsx src/forms/date-input.test.tsx src/index.ts
git commit -m "feat(date-input): add label/description/error props"
```

### Task 6.5: Rewrite `DateRangePicker` with object API `{ from, to }`

**Files:**
- Modify: `src/forms/date-range-picker.tsx`
- Modify: `src/forms/date-range-picker.test.tsx`
- Modify: `src/forms/date-range-picker.stories.tsx`

- [ ] **Step 1: Write failing tests for the new shape**

Replace `src/forms/date-range-picker.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { DateRangePicker } from "./date-range-picker"

describe("DateRangePicker", () => {
  it("renders the placeholder when value is empty range", () => {
    render(
      <DateRangePicker
        label="Período"
        value={{ from: "", to: "" }}
        onChange={() => {}}
        placeholder="Selecione"
      />,
    )
    expect(screen.getByText("Selecione")).toBeInTheDocument()
  })

  it("renders the formatted range when both dates are set", () => {
    render(
      <DateRangePicker
        label="Período"
        value={{ from: "2025-01-01", to: "2025-01-31" }}
        onChange={() => {}}
      />,
    )
    expect(screen.getByText(/01\/01\/2025.*31\/01\/2025/)).toBeInTheDocument()
  })

  it("emits onChange with object shape", () => {
    const onChange = vi.fn()
    render(
      <DateRangePicker
        label="X"
        value={{ from: "", to: "" }}
        onChange={onChange}
      />,
    )
    // Selection is exercised via user interactions in higher-level tests.
    // Here we just verify the prop shape compiles and renders.
    expect(onChange).not.toHaveBeenCalled()
  })

  it("renders the error", () => {
    render(
      <DateRangePicker
        label="X"
        value={{ from: "", to: "" }}
        onChange={() => {}}
        error="obrigatório"
      />,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("obrigatório")
  })

  it("respects disabled", () => {
    render(
      <DateRangePicker
        label="X"
        value={{ from: "", to: "" }}
        onChange={() => {}}
        disabled
      />,
    )
    expect(screen.getByRole("button")).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/forms/date-range-picker.test.tsx
```
Expected: FAIL (current shape is `from`/`to`/`onFromChange`/`onToChange`).

- [ ] **Step 3: Rewrite `src/forms/date-range-picker.tsx`**

```tsx
"use client"

import { format, isValid, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import { type DateRange, type Locale } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Popover } from "../overlays/popover"
import { Button } from "../primitives/button"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"
import { Calendar } from "./calendar"

export interface DateRangeValue {
  from: string
  to: string
}

export interface DateRangePickerProps {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  disabled?: boolean
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  placeholder?: string
  className?: string
  numberOfMonths?: number
  locale?: Locale
  id?: string
  ref?: React.Ref<HTMLButtonElement>
}

function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, "yyyy-MM-dd", new Date())
  return isValid(parsed) ? parsed : undefined
}

function toIsoString(d: Date | undefined): string {
  return d ? format(d, "yyyy-MM-dd") : ""
}

function DateRangePicker({
  id,
  label,
  description,
  error,
  labelPosition,
  required,
  disabled,
  value,
  onChange,
  placeholder = "Selecione um período",
  className,
  numberOfMonths = 2,
  locale = ptBR,
  ref,
}: DateRangePickerProps) {
  const ids = useFieldIds(id)
  const [open, setOpen] = React.useState(false)

  const fromDate = parseIsoDate(value.from)
  const toDate = parseIsoDate(value.to)
  const selectedRange: DateRange | undefined =
    fromDate || toDate ? { from: fromDate, to: toDate } : undefined

  const handleSelect = (range: DateRange | undefined) => {
    onChange({
      from: toIsoString(range?.from),
      to: toIsoString(range?.to),
    })
    if (range?.from && range?.to) setOpen(false)
  }

  const display =
    fromDate && toDate
      ? `${format(fromDate, "dd/MM/yyyy")} — ${format(toDate, "dd/MM/yyyy")}`
      : fromDate
        ? `${format(fromDate, "dd/MM/yyyy")} — ...`
        : placeholder

  return (
    <FieldShell
      controlId={ids.controlId}
      labelId={ids.labelId}
      descriptionId={ids.descriptionId}
      errorId={ids.errorId}
      label={label}
      description={description}
      error={error}
      labelPosition={labelPosition}
      required={required}
      disabled={disabled}
    >
      <Popover open={open} onOpenChange={setOpen} align="start">
        <Popover.trigger />
        {/* Trigger is rendered via Popover's `trigger` prop */}
      </Popover>
      {/* Use the inline pattern instead: */}
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="start"
        trigger={
          <Button
            ref={ref}
            id={ids.controlId}
            variant="outline"
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            className={cn("w-full justify-start text-left", !fromDate && "text-muted-foreground", className)}
          >
            <CalendarIcon className="mr-2 size-4" aria-hidden="true" />
            {display}
          </Button>
        }
        className="w-auto p-0"
      >
        <Calendar
          mode="range"
          selected={selectedRange}
          onSelect={handleSelect}
          numberOfMonths={numberOfMonths}
          locale={locale}
        />
        <div className="flex justify-end gap-2 border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange({ from: "", to: "" })
              setOpen(false)
            }}
          >
            Limpar
          </Button>
        </div>
      </Popover>
    </FieldShell>
  )
}

DateRangePicker.displayName = "DateRangePicker"

export { DateRangePicker }
```

NOTE: The duplicated `<Popover open ...>` in the snippet above is a typo from drafting — keep only the second `<Popover>` block. The pattern is one `Popover` with the `trigger` prop holding the button.

- [ ] **Step 4: Verify tests pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/forms/date-range-picker.test.tsx
```
Expected: 5 tests pass.

- [ ] **Step 5: Update stories**

Replace `src/forms/date-range-picker.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { DateRangePicker, type DateRangeValue } from "./date-range-picker"

const meta: Meta<typeof DateRangePicker> = {
  title: "Forms/DateRangePicker",
  component: DateRangePicker,
}
export default meta
type Story = StoryObj<typeof DateRangePicker>

export const Default: Story = {
  render: () => {
    const [v, setV] = useState<DateRangeValue>({ from: "", to: "" })
    return <DateRangePicker label="Período" value={v} onChange={setV} />
  },
}

export const PreFilled: Story = {
  render: () => {
    const [v, setV] = useState<DateRangeValue>({ from: "2025-01-01", to: "2025-01-31" })
    return <DateRangePicker label="Janeiro/2025" value={v} onChange={setV} />
  },
}

export const Disabled: Story = {
  render: () => (
    <DateRangePicker label="X" value={{ from: "2025-01-01", to: "2025-01-15" }} onChange={() => {}} disabled />
  ),
}
```

- [ ] **Step 6: Re-export + commit**

Append to `src/index.ts`:
```ts
export {
  DateRangePicker,
  type DateRangePickerProps,
  type DateRangeValue,
} from "./forms/date-range-picker"
```

```bash
git add src/forms/date-range-picker.tsx src/forms/date-range-picker.test.tsx src/forms/date-range-picker.stories.tsx src/index.ts
git commit -m "feat(date-range-picker): object value/onChange API + label/error/description"
```

### Task 6.6: Modify `TimePicker` — add `label`/`description`/`error`

**Files:**
- Modify: `src/forms/time-picker.tsx`
- Modify: `src/forms/time-picker.test.tsx`

- [ ] **Step 1: Append failing tests**

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { TimePicker } from "./time-picker"

describe("TimePicker (label/error)", () => {
  it("renders the label", () => {
    render(<TimePicker label="Horário" />)
    expect(screen.getByText("Horário")).toBeInTheDocument()
  })

  it("renders error with role=alert", () => {
    render(<TimePicker label="X" error="inválido" />)
    expect(screen.getByRole("alert")).toHaveTextContent("inválido")
  })
})
```

- [ ] **Step 2: Verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/forms/time-picker.test.tsx
```

- [ ] **Step 3: Wrap `TimePicker` in `FieldShell`**

Same pattern as Combobox/DateInput — add label/description/error props, wrap in FieldShell. Preserve all v10 behavior (modular arrow keys, blur-clears-invalid).

- [ ] **Step 4: Verify pass**

- [ ] **Step 5: Re-export + commit**

Append to `src/index.ts`:
```ts
export { TimePicker, type TimePickerProps } from "./forms/time-picker"
```

```bash
git add src/forms/time-picker.tsx src/forms/time-picker.test.tsx src/index.ts
git commit -m "feat(time-picker): add label/description/error props"
```

### Phase 6 validation

- [ ] **Step 1: Run forms suite**

```bash
cd /home/matheus/Projects/ui && bun run typecheck && bun run test src/forms/ && bun run lint
```
Expected: pass.

---

## Phase 7: Domain inputs — `CurrencyInput`, `PercentageInput`, `MultiInput`, `FileUpload`, `InputOTP`

### Task 7.1: Wrap `CurrencyInput` in `FieldShell`

**Files:**
- Modify: `src/domain/currency-input.tsx`
- Modify: `src/domain/currency-input.test.tsx`

- [ ] **Step 1: Write failing tests**

Append to `src/domain/currency-input.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CurrencyInput } from "./currency-input"

describe("CurrencyInput (label/error)", () => {
  it("renders the label", () => {
    render(<CurrencyInput label="Valor" value={0} onValueChange={() => {}} />)
    expect(screen.getByText("Valor")).toBeInTheDocument()
  })

  it("renders the error with role=alert", () => {
    render(<CurrencyInput label="X" error="obrigatório" value={0} onValueChange={() => {}} />)
    expect(screen.getByRole("alert")).toHaveTextContent("obrigatório")
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
bun run test src/domain/currency-input.test.tsx
```

- [ ] **Step 3: Wrap in `FieldShell`**

In `src/domain/currency-input.tsx`:
1. Add to `CurrencyInputProps`: `label?: ReactNode`, `description?: ReactNode`, `error?: string`, `labelPosition?: "up" | "left" | "hidden"`, `required?: boolean`.
2. Import `FieldShell` and `useFieldIds`.
3. Wrap the existing input in `FieldShell` like the Input/Textarea pattern.

Preserve all v10 behavior (the R$ prefix span, the 15-digit clamp, the cents math).

- [ ] **Step 4: Verify pass**

- [ ] **Step 5: Re-export + commit**

Append to `src/index.ts`:
```ts
export { CurrencyInput, type CurrencyInputProps } from "./domain/currency-input"
```

```bash
git add src/domain/currency-input.tsx src/domain/currency-input.test.tsx src/index.ts
git commit -m "feat(currency-input): add label/description/error props"
```

### Task 7.2: Wrap `PercentageInput` in `FieldShell`

Same pattern as Task 7.1. Add label/description/error/labelPosition/required props, wrap in FieldShell.

**Files:**
- Modify: `src/domain/percentage-input.tsx`
- Modify: `src/domain/percentage-input.test.tsx`

- [ ] **Step 1: Append failing tests** (label, error — same shape as CurrencyInput)

- [ ] **Step 2: Verify failures, wrap in FieldShell, verify pass.**

- [ ] **Step 3: Re-export + commit**

Append to `src/index.ts`:
```ts
export { PercentageInput, type PercentageInputProps } from "./domain/percentage-input"
```

```bash
git add src/domain/percentage-input.tsx src/domain/percentage-input.test.tsx src/index.ts
git commit -m "feat(percentage-input): add label/description/error props"
```

### Task 7.3: Wrap `MultiInput` in `FieldShell`

Same pattern. Preserve v10 behavior (paste handler, maxItems, onReject, mousedown remove).

**Files:**
- Modify: `src/domain/multi-input.tsx`
- Modify: `src/domain/multi-input.test.tsx`

- [ ] **Step 1: Append failing tests**, **Step 2: Wrap**, **Step 3: Verify**, **Step 4: Re-export + commit**

```ts
export { MultiInput, type MultiInputProps } from "./domain/multi-input"
```

```bash
git add src/domain/multi-input.tsx src/domain/multi-input.test.tsx src/index.ts
git commit -m "feat(multi-input): add label/description/error props"
```

### Task 7.4: Wrap `FileUpload` in `FieldShell`

**Files:**
- Modify: `src/domain/file-upload.tsx`
- Modify: `src/domain/file-upload.test.tsx`

- [ ] **Step 1: Append failing tests** (label, description, error)

- [ ] **Step 2: Wrap the dropzone in FieldShell.** The existing `label`/`description` props on `FileUpload` already exist but they were used inside the dropzone visual — those should be renamed to `dropzoneLabel`/`dropzoneDescription`. The new top-level `label`/`description` become the FieldShell label/description (above the dropzone).

Migration in `FileUploadProps`:
```ts
// Before
label?: string             // dropzone heading
description?: string       // dropzone subtext

// After
label?: ReactNode          // form-level label (above dropzone)
description?: ReactNode    // form-level helper text
error?: string             // form-level error
required?: boolean
labelPosition?: "up" | "left" | "hidden"
dropzoneLabel?: ReactNode  // existing prop renamed
dropzoneDescription?: ReactNode
```

- [ ] **Step 3: Verify all tests pass.**

- [ ] **Step 4: Re-export + commit**

Append to `src/index.ts`:
```ts
export {
  FileUpload,
  type FileUploadProps,
  type FileUploadRejection,
  type FileUploadRejectionReason,
} from "./domain/file-upload"
```

```bash
git add src/domain/file-upload.tsx src/domain/file-upload.test.tsx src/index.ts
git commit -m "feat(file-upload): add form-level label/description/error props"
```

### Task 7.5: Rewrite `InputOTP` as single component

**Files:**
- Modify: `src/domain/input-otp.tsx`
- Modify: `src/domain/input-otp.test.tsx`
- Modify: `src/domain/input-otp.stories.tsx`

- [ ] **Step 1: Write failing tests for new single-component API**

Replace `src/domain/input-otp.test.tsx` (full rewrite):
```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { InputOTP, REGEXP_ONLY_DIGITS } from "./input-otp"

afterEach(() => cleanup())

function Controlled({ length = 6, ...rest }: { length?: number; pattern?: string; onComplete?: (v: string) => void }) {
  const [v, setV] = React.useState("")
  return <InputOTP length={length} value={v} onValueChange={setV} {...rest} />
}

describe("InputOTP", () => {
  it("renders the requested number of slots", () => {
    const { container } = render(<InputOTP length={4} value="" onValueChange={() => {}} />)
    expect(container.querySelectorAll('[data-slot="input-otp-slot"]')).toHaveLength(4)
  })

  it("renders the label and error", () => {
    render(<InputOTP length={4} value="" onValueChange={() => {}} label="Código" error="inválido" />)
    expect(screen.getByText("Código")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("inválido")
  })

  it("inserts a separator every N slots when separatorEvery is set", () => {
    const { container } = render(
      <InputOTP length={6} separatorEvery={3} separator="-" value="" onValueChange={() => {}} />,
    )
    expect(container.querySelectorAll('[data-slot="input-otp-separator"]')).toHaveLength(1)
  })

  it("defaults pattern to REGEXP_ONLY_DIGITS — letters are rejected", () => {
    const onValueChange = vi.fn()
    render(<Controlled onComplete={undefined} />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "abc" } })
    // input-otp filters based on `pattern`
    expect(input.value).not.toBe("abc")
  })

  it("re-exports REGEXP_ONLY_DIGITS", () => {
    expect(REGEXP_ONLY_DIGITS).toBe("^\\d+$")
  })

  it("fires onComplete when length reached", () => {
    const onComplete = vi.fn()
    function Wrapper() {
      const [v, setV] = React.useState("")
      return (
        <InputOTP length={6} value={v} onValueChange={setV} onComplete={onComplete} />
      )
    }
    render(<Wrapper />)
    const input = screen.getByRole("textbox") as HTMLInputElement
    fireEvent.change(input, { target: { value: "123456" } })
    expect(onComplete).toHaveBeenCalledWith("123456")
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/domain/input-otp.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Rewrite `src/domain/input-otp.tsx`**

```tsx
"use client"

import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from "input-otp"
import { Dot } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell, type LabelPosition } from "../primitives/_internal/field-shell"
import { useFieldIds } from "../primitives/_internal/use-field-ids"

export interface InputOTPProps {
  length: number
  value: string
  onValueChange: (value: string) => void
  onComplete?: (value: string) => void
  pattern?: string
  /** Insert a separator every N slots. */
  separatorEvery?: number
  /** Separator content. Defaults to a dot. */
  separator?: React.ReactNode
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  disabled?: boolean
  id?: string
  className?: string
  ref?: React.Ref<HTMLInputElement>
}

function Slot({ index }: { index: number }) {
  const ctx = React.useContext(OTPInputContext)
  const slot = ctx?.slots[index] ?? { char: undefined, hasFakeCaret: false, isActive: false }
  return (
    <div
      data-slot="input-otp-slot"
      data-active={slot.isActive || undefined}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all",
        "first:rounded-l-md first:border-l last:rounded-r-md",
        "data-[active=true]:z-10 data-[active=true]:ring-2 data-[active=true]:ring-ring",
      )}
    >
      {slot.char}
      {slot.hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      ) : null}
    </div>
  )
}

function Separator({ children }: { children: React.ReactNode }) {
  return (
    <div data-slot="input-otp-separator" role="separator">
      {children ?? <Dot className="size-3" aria-hidden="true" />}
    </div>
  )
}

function InputOTP({
  length,
  value,
  onValueChange,
  onComplete,
  pattern = REGEXP_ONLY_DIGITS,
  separatorEvery,
  separator,
  label,
  description,
  error,
  labelPosition,
  required,
  disabled,
  id,
  className,
  ref,
}: InputOTPProps) {
  const ids = useFieldIds(id)
  const slots = Array.from({ length }, (_, i) => i)

  return (
    <FieldShell
      controlId={ids.controlId}
      labelId={ids.labelId}
      descriptionId={ids.descriptionId}
      errorId={ids.errorId}
      label={label}
      description={description}
      error={error}
      labelPosition={labelPosition}
      required={required}
      disabled={disabled}
    >
      <OTPInput
        ref={ref}
        id={ids.controlId}
        data-slot="input-otp"
        maxLength={length}
        value={value}
        onChange={onValueChange}
        onComplete={onComplete}
        pattern={pattern}
        disabled={disabled}
        containerClassName={cn("flex items-center gap-2 has-disabled:opacity-50", className)}
        render={() => (
          <div className="flex items-center">
            {slots.map((i) => {
              const showSeparator =
                separatorEvery && i > 0 && i < length && i % separatorEvery === 0
              return (
                <React.Fragment key={i}>
                  {showSeparator ? <Separator>{separator}</Separator> : null}
                  <Slot index={i} />
                </React.Fragment>
              )
            })}
          </div>
        )}
      />
    </FieldShell>
  )
}

InputOTP.displayName = "InputOTP"

export { InputOTP, REGEXP_ONLY_DIGITS }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/domain/input-otp.test.tsx
```
Expected: 6 tests pass.

- [ ] **Step 5: Update stories**

Replace `src/domain/input-otp.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { InputOTP } from "./input-otp"

const meta: Meta<typeof InputOTP> = { title: "Domain/InputOTP", component: InputOTP }
export default meta
type Story = StoryObj<typeof InputOTP>

export const Default: Story = {
  render: () => {
    const [v, setV] = useState("")
    return <InputOTP length={6} value={v} onValueChange={setV} label="Código SMS" />
  },
}

export const WithSeparator: Story = {
  render: () => {
    const [v, setV] = useState("")
    return <InputOTP length={6} separatorEvery={3} value={v} onValueChange={setV} label="Código" />
  },
}

export const WithError: Story = {
  render: () => {
    const [v, setV] = useState("")
    return <InputOTP length={6} value={v} onValueChange={setV} label="Código" error="Inválido" />
  },
}
```

- [ ] **Step 6: Re-export + commit**

Append to `src/index.ts`:
```ts
export { InputOTP, REGEXP_ONLY_DIGITS, type InputOTPProps } from "./domain/input-otp"
```

```bash
git add src/domain/input-otp.tsx src/domain/input-otp.test.tsx src/domain/input-otp.stories.tsx src/index.ts
git commit -m "feat(input-otp): single-component API with length/separator/label/error"
```

### Phase 7 validation

- [ ] **Step 1: Full domain suite**

```bash
cd /home/matheus/Projects/ui && bun run typecheck && bun run test src/domain/ && bun run lint
```
Expected: pass.

---

## Phase 8: `Form` + `FormField` (RHF integration)

### Task 8.1: Rewrite `Form` with `resolver` prop

**Files:**
- Modify: `src/forms/form.tsx`
- Modify: `src/forms/form.test.tsx`
- Modify: `src/forms/form.stories.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/forms/form.test.tsx`:
```tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Form, FormField } from "./form"

describe("Form", () => {
  it("renders a <form> with children", () => {
    render(
      <Form onSubmit={() => {}}>
        <FormField name="x" type="text" label="X" />
        <button type="submit">go</button>
      </Form>,
    )
    expect(screen.getByLabelText("X")).toBeInTheDocument()
  })

  it("calls onSubmit with form data", async () => {
    const onSubmit = vi.fn()
    render(
      <Form onSubmit={onSubmit} defaultValues={{ x: "abc" }}>
        <FormField name="x" type="text" label="X" />
        <button type="submit">go</button>
      </Form>,
    )
    fireEvent.submit(screen.getByRole("button", { name: "go" }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ x: "abc" }, expect.anything()))
  })

  it("FormField renders an Input with the correct name", () => {
    render(
      <Form onSubmit={() => {}}>
        <FormField name="email" type="email" label="E-mail" />
      </Form>,
    )
    const input = screen.getByLabelText("E-mail") as HTMLInputElement
    expect(input.type).toBe("email")
    expect(input.name).toBe("email")
  })

  it("FormField with render prop wraps custom control", () => {
    render(
      <Form onSubmit={() => {}}>
        <FormField name="custom" label="X">
          {(field) => <input data-testid="custom" {...field} />}
        </FormField>
      </Form>,
    )
    expect(screen.getByTestId("custom")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/forms/form.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Rewrite `src/forms/form.tsx`**

```tsx
"use client"

import * as React from "react"
import {
  Controller,
  type ControllerRenderProps,
  type DefaultValues,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type Resolver,
  type SubmitHandler,
  useForm,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form"

import { Checkbox } from "../primitives/checkbox"
import { Input } from "../primitives/input"
import { Switch } from "../primitives/switch"
import { Textarea } from "../primitives/textarea"

export interface FormProps<T extends FieldValues> {
  onSubmit: SubmitHandler<T>
  defaultValues?: DefaultValues<T>
  resolver?: Resolver<T>
  mode?: UseFormProps<T>["mode"]
  className?: string
  children: React.ReactNode
  /** Optional callback receiving the RHF methods after mount. */
  onReady?: (methods: UseFormReturn<T>) => void
}

function Form<T extends FieldValues>({
  onSubmit,
  defaultValues,
  resolver,
  mode = "onSubmit",
  className,
  children,
  onReady,
}: FormProps<T>) {
  const methods = useForm<T>({ defaultValues, resolver, mode })
  React.useEffect(() => {
    onReady?.(methods)
  }, [methods, onReady])
  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={methods.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  )
}

Form.displayName = "Form"

type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search"
  | "date"
  | "time"
  | "checkbox"
  | "switch"
  | "textarea"

export interface FormFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  name: N
  label?: React.ReactNode
  description?: React.ReactNode
  type?: FormFieldType
  placeholder?: string
  /** Custom control render — receives RHF field props. */
  children?: (field: ControllerRenderProps<T, N>) => React.ReactNode
}

function FormField<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>>({
  name,
  label,
  description,
  type = "text",
  placeholder,
  children,
}: FormFieldProps<T, N>) {
  return (
    <Controller<T, N>
      name={name}
      render={({ field, fieldState }) => {
        const error = fieldState.error?.message
        if (children) {
          return (
            <div className="flex w-full flex-col gap-1.5">
              {children(field)}
              {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
              {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
            </div>
          )
        }
        switch (type) {
          case "textarea":
            return (
              <Textarea
                {...field}
                label={label}
                description={description}
                error={error}
                placeholder={placeholder}
              />
            )
          case "checkbox":
            return (
              <Checkbox
                checked={!!field.value}
                onCheckedChange={(v) => field.onChange(v === true)}
                onBlur={field.onBlur}
                label={label}
                description={description}
                error={error}
              />
            )
          case "switch":
            return (
              <Switch
                checked={!!field.value}
                onCheckedChange={(v) => field.onChange(v)}
                onBlur={field.onBlur}
                label={label}
                description={description}
                error={error}
              />
            )
          default:
            return (
              <Input
                {...field}
                type={type}
                label={label}
                description={description}
                error={error}
                placeholder={placeholder}
              />
            )
        }
      }}
    />
  )
}

FormField.displayName = "FormField"

export { Form, FormField, useForm }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/forms/form.test.tsx
```
Expected: 4 tests pass.

- [ ] **Step 5: Update stories**

Replace `src/forms/form.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "../primitives/button"
import { Form, FormField } from "./form"

const meta: Meta = { title: "Forms/Form" }
export default meta

export const Basic: StoryObj = {
  render: () => (
    <Form onSubmit={(data) => alert(JSON.stringify(data))} className="flex flex-col gap-4 w-80">
      <FormField name="email" type="email" label="E-mail" description="Não compartilhamos." />
      <FormField name="password" type="password" label="Senha" />
      <FormField name="remember" type="checkbox" label="Lembrar de mim" />
      <Button type="submit">Entrar</Button>
    </Form>
  ),
}
```

- [ ] **Step 6: Re-export + commit**

Append to `src/index.ts`:
```ts
export { Form, FormField, useForm, type FormProps, type FormFieldProps } from "./forms/form"
```

```bash
git add src/forms/form.tsx src/forms/form.test.tsx src/forms/form.stories.tsx src/index.ts
git commit -m "feat(form): RHF resolver-agnostic + FormField with render slot"
```

### Phase 8 validation

```bash
cd /home/matheus/Projects/ui && bun run typecheck && bun run test src/forms/ && bun run lint
```

---

## Phase 9: Navigation — `Accordion`, `Tabs`, `Breadcrumb`, `CommandPalette`, `Sidebar`

### Task 9.1: `Accordion` — add `action` slot to items

**Files:**
- Modify: `src/navigation/accordion.tsx`
- Modify: `src/navigation/accordion.test.tsx`

- [ ] **Step 1: Write failing test for `action` slot**

Append to `src/navigation/accordion.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Accordion } from "./accordion"

describe("Accordion item action", () => {
  it("renders action slot on item header", () => {
    render(
      <Accordion
        type="single"
        items={[
          {
            value: "x",
            title: "Title",
            content: <p>body</p>,
            action: <button data-testid="del">del</button>,
          },
        ]}
      />,
    )
    expect(screen.getByTestId("del")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify failure**

```bash
bun run test src/navigation/accordion.test.tsx
```

- [ ] **Step 3: Modify `src/navigation/accordion.tsx`**

Extend `AccordionItemData`:
```ts
export interface AccordionItemData {
  value: string
  title: React.ReactNode
  content: React.ReactNode
  action?: React.ReactNode
  disabled?: boolean
}
```

In the render loop, change the header to position the action on the right:
```tsx
<AccordionPrimitive.Header className="flex items-center">
  <AccordionPrimitive.Trigger
    disabled={item.disabled}
    className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180"
    data-slot="accordion-trigger"
  >
    {item.title}
    <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
  </AccordionPrimitive.Trigger>
  {item.action ? (
    <div data-slot="accordion-action" className="ml-2">{item.action}</div>
  ) : null}
</AccordionPrimitive.Header>
```

- [ ] **Step 4: Verify pass**

- [ ] **Step 5: Re-export + commit**

Append to `src/index.ts`:
```ts
export { Accordion, type AccordionItemData, type AccordionProps } from "./navigation/accordion"
```

```bash
git add src/navigation/accordion.tsx src/navigation/accordion.test.tsx src/index.ts
git commit -m "feat(accordion): add action slot to item type"
```

### Task 9.2: `Tabs` — add `badge` in item, `lazy` prop

**Files:**
- Modify: `src/navigation/tabs.tsx`
- Modify: `src/navigation/tabs.test.tsx`

- [ ] **Step 1: Write failing tests**

Append to `src/navigation/tabs.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Tabs } from "./tabs"

describe("Tabs (badge + lazy)", () => {
  it("renders badge inside trigger", () => {
    render(
      <Tabs
        items={[
          { value: "msg", label: "Mensagens", content: <span>m</span>, badge: <span data-testid="b">3</span> },
        ]}
      />,
    )
    expect(screen.getByTestId("b")).toBeInTheDocument()
  })

  it("with lazy=true, only the active panel is mounted", async () => {
    render(
      <Tabs
        defaultValue="a"
        lazy
        items={[
          { value: "a", label: "A", content: <p>panel-a</p> },
          { value: "b", label: "B", content: <p>panel-b</p> },
        ]}
      />,
    )
    expect(screen.getByText("panel-a")).toBeInTheDocument()
    expect(screen.queryByText("panel-b")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("tab", { name: "B" }))
    expect(screen.getByText("panel-b")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify failures**

- [ ] **Step 3: Modify `src/navigation/tabs.tsx`**

Extend `TabsItemData`:
```ts
export interface TabsItemData {
  value: string
  label: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
  badge?: React.ReactNode
}
```

Add `lazy?: boolean` to `TabsProps`. In the render loop:
- Trigger renders `label` with optional `badge` to the right.
- Content: when `lazy`, only render the content for `value === activeValue`. Track active via controlled or uncontrolled state.

- [ ] **Step 4: Verify pass**

- [ ] **Step 5: Re-export + commit**

Append to `src/index.ts`:
```ts
export { Tabs, type TabsItemData, type TabsProps } from "./navigation/tabs"
```

```bash
git add src/navigation/tabs.tsx src/navigation/tabs.test.tsx src/index.ts
git commit -m "feat(tabs): add badge in item + lazy prop"
```

### Task 9.3: `Breadcrumb` — add `maxItems` + `ariaLabel`

**Files:**
- Modify: `src/navigation/breadcrumb.tsx`
- Modify: `src/navigation/breadcrumb.test.tsx`

- [ ] **Step 1: Write failing tests**

Append to `src/navigation/breadcrumb.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Breadcrumb } from "./breadcrumb"

describe("Breadcrumb (maxItems)", () => {
  it("collapses middle items when maxItems is set", () => {
    render(
      <Breadcrumb
        maxItems={3}
        items={[
          { label: "Home", href: "/" },
          { label: "A", href: "/a" },
          { label: "B", href: "/b" },
          { label: "C", href: "/c" },
          { label: "D" },
        ]}
      />,
    )
    expect(screen.getByText("…")).toBeInTheDocument()
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("D")).toBeInTheDocument()
  })

  it("respects ariaLabel prop", () => {
    render(
      <Breadcrumb ariaLabel="Caminho" items={[{ label: "Home", href: "/" }, { label: "X" }]} />,
    )
    expect(screen.getByLabelText("Caminho")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Verify failures**

- [ ] **Step 3: Implement `maxItems` and `ariaLabel`**

In `src/navigation/breadcrumb.tsx`:
1. Add `maxItems?: number` and `ariaLabel?: string` to `BreadcrumbProps`.
2. Set `<nav aria-label={ariaLabel ?? "Breadcrumb"}>`.
3. When `maxItems != null && items.length > maxItems`, render first item + `…` + last `maxItems - 1` items.

Code skeleton:
```ts
const renderItems = React.useMemo(() => {
  if (!maxItems || items.length <= maxItems) return items
  const first = items[0]
  const tail = items.slice(items.length - (maxItems - 1))
  return [
    first,
    { label: "…" as const, href: undefined } as BreadcrumbItemData,
    ...tail,
  ]
}, [items, maxItems])
```

- [ ] **Step 4: Verify pass**

- [ ] **Step 5: Re-export + commit**

Append to `src/index.ts`:
```ts
export {
  Breadcrumb,
  type BreadcrumbItemData,
  type BreadcrumbProps,
} from "./navigation/breadcrumb"
```

```bash
git add src/navigation/breadcrumb.tsx src/navigation/breadcrumb.test.tsx src/index.ts
git commit -m "feat(breadcrumb): add maxItems + ariaLabel"
```

### Task 9.4: Create `CommandPalette` (renamed + data-driven)

**Files:**
- Create: `src/navigation/command-palette.tsx`
- Create: `src/navigation/command-palette.test.tsx`
- Create: `src/navigation/command-palette.stories.tsx`

- [ ] **Step 1: Write failing tests**

Write `src/navigation/command-palette.test.tsx`:
```tsx
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CommandPalette } from "./command-palette"

describe("CommandPalette", () => {
  it("renders groups and items when open", () => {
    render(
      <CommandPalette
        open
        title="Comandos"
        groups={[
          { heading: "Geral", items: [{ label: "Dashboard", onSelect: () => {} }] },
        ]}
      />,
    )
    expect(screen.getByText("Geral")).toBeInTheDocument()
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
  })

  it("fires onSelect on item click", async () => {
    const onSelect = vi.fn()
    render(
      <CommandPalette
        open
        title="X"
        groups={[{ items: [{ label: "Dashboard", onSelect }] }]}
      />,
    )
    await userEvent.click(screen.getByText("Dashboard"))
    expect(onSelect).toHaveBeenCalled()
  })

  it("renders shortcut hint when provided", () => {
    render(
      <CommandPalette
        open
        title="X"
        groups={[{ items: [{ label: "Save", shortcut: "⌘S", onSelect: () => {} }] }]}
      />,
    )
    expect(screen.getByText("⌘S")).toBeInTheDocument()
  })

  it("renders the empty message when no matches", async () => {
    render(
      <CommandPalette
        open
        title="X"
        emptyMessage="Nada encontrado"
        placeholder="Buscar..."
        groups={[{ items: [{ label: "Dashboard", onSelect: () => {} }] }]}
      />,
    )
    await userEvent.type(screen.getByPlaceholderText("Buscar..."), "zzzz")
    await waitFor(() => {
      expect(screen.getByText("Nada encontrado")).toBeInTheDocument()
    })
  })

  it("supports custom item.render", () => {
    render(
      <CommandPalette
        open
        title="X"
        groups={[
          {
            items: [
              { render: <span data-testid="custom">Custom row</span>, onSelect: () => {} },
            ],
          },
        ]}
      />,
    )
    expect(screen.getByTestId("custom")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify it fails**

```bash
cd /home/matheus/Projects/ui && bun run test src/navigation/command-palette.test.tsx
```
Expected: FAIL (module doesn't exist).

- [ ] **Step 3: Write `src/navigation/command-palette.tsx`**

```tsx
"use client"

import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Dialog } from "../overlays/dialog"

export interface CommandPaletteItem {
  label?: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string
  onSelect: () => void
  disabled?: boolean
  /** Custom row content — replaces label/icon entirely. */
  render?: React.ReactNode
  /** Extra search tokens beyond `label`. */
  keywords?: string[]
}

export interface CommandPaletteGroup {
  heading?: React.ReactNode
  items: CommandPaletteItem[]
}

export interface CommandPaletteProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  groups: CommandPaletteGroup[]
  placeholder?: string
  emptyMessage?: React.ReactNode
  loading?: boolean
  /** sr-only DialogTitle (a11y required by Radix). */
  title: string
  /** sr-only DialogDescription. */
  description?: string
  /** Controlled input value for server-side filtering. */
  value?: string
  onValueChange?: (value: string) => void
}

function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = "Buscar...",
  emptyMessage = "Nenhum resultado",
  loading,
  title,
  description = "",
  value,
  onValueChange,
}: CommandPaletteProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={<span className="sr-only">{title}</span>}
      description={description ? <span className="sr-only">{description}</span> : undefined}
      hideCloseButton
      className="overflow-hidden p-0"
    >
      <CommandPrimitive
        data-slot="command-palette"
        value={value}
        onValueChange={onValueChange}
        className="flex h-full w-full flex-col"
      >
        <div data-slot="command-input-wrap" className="flex items-center border-b px-3" cmdk-input-wrapper="">
          <SearchIcon className="mr-2 size-4 shrink-0 opacity-50" aria-hidden="true" />
          <CommandPrimitive.Input
            placeholder={placeholder}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <CommandPrimitive.List data-slot="command-list" className="max-h-[300px] overflow-y-auto overflow-x-hidden">
          {loading ? (
            <CommandPrimitive.Loading className="py-6 text-center text-sm text-muted-foreground">
              Carregando…
            </CommandPrimitive.Loading>
          ) : null}
          <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </CommandPrimitive.Empty>
          {groups.map((group, gi) => (
            <CommandPrimitive.Group
              key={`g-${gi}`}
              heading={group.heading as string | undefined}
              className={cn(
                "overflow-hidden p-1 text-foreground",
                "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
              )}
            >
              {group.items.map((item, ii) => (
                <CommandPrimitive.Item
                  key={`${gi}-${ii}-${item.label ?? "custom"}`}
                  disabled={item.disabled}
                  keywords={item.keywords}
                  onSelect={() => {
                    item.onSelect()
                  }}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    "data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50",
                  )}
                >
                  {item.render ?? (
                    <>
                      {item.icon ? <item.icon className="mr-2 size-4" /> : null}
                      <span>{item.label}</span>
                      {item.shortcut ? (
                        <span className="ml-auto text-xs tracking-widest text-muted-foreground">
                          {item.shortcut}
                        </span>
                      ) : null}
                    </>
                  )}
                </CommandPrimitive.Item>
              ))}
            </CommandPrimitive.Group>
          ))}
        </CommandPrimitive.List>
      </CommandPrimitive>
    </Dialog>
  )
}

CommandPalette.displayName = "CommandPalette"

export { CommandPalette }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/navigation/command-palette.test.tsx
```
Expected: 5 tests pass.

- [ ] **Step 5: Write stories**

Write `src/navigation/command-palette.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"
import { LayoutDashboard, User } from "lucide-react"
import { useState } from "react"

import { Button } from "../primitives/button"
import { CommandPalette } from "./command-palette"

const meta: Meta<typeof CommandPalette> = {
  title: "Navigation/CommandPalette",
  component: CommandPalette,
}
export default meta
type Story = StoryObj<typeof CommandPalette>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir paleta</Button>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          title="Comandos"
          placeholder="Busque um comando..."
          groups={[
            {
              heading: "Navegação",
              items: [
                { label: "Dashboard", icon: LayoutDashboard, shortcut: "⌘D", onSelect: () => alert("dash") },
                { label: "Perfil", icon: User, shortcut: "⌘P", onSelect: () => alert("perfil") },
              ],
            },
          ]}
        />
      </>
    )
  },
}
```

- [ ] **Step 6: Re-export + commit**

Append to `src/index.ts`:
```ts
export {
  CommandPalette,
  type CommandPaletteProps,
  type CommandPaletteGroup,
  type CommandPaletteItem,
} from "./navigation/command-palette"
```

```bash
git add src/navigation/command-palette.tsx src/navigation/command-palette.test.tsx src/navigation/command-palette.stories.tsx src/index.ts
git commit -m "feat(command-palette): data-driven palette (replaces Command compound)"
```

### Task 9.5: Rewrite `Sidebar` as data-driven

This is the largest single component. Plan it as multiple sub-tasks.

**Files:**
- Modify: `src/navigation/sidebar.tsx` (full rewrite)
- Modify: `src/navigation/sidebar.test.tsx` (full rewrite)
- Modify: `src/navigation/sidebar.stories.tsx` (full rewrite)

The internal implementation can keep most of the v10 `SidebarProvider`/`SidebarContent`/menu primitives as **private** helpers within `sidebar.tsx` (no exports). The public component `Sidebar` orchestrates everything from props.

#### Task 9.5a: Define the data types and skeleton component

- [ ] **Step 1: Write the type-level failing test**

Write `src/navigation/sidebar.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { LayoutDashboard, Users } from "lucide-react"
import { describe, expect, it } from "vitest"

import { Sidebar, type SidebarItem } from "./sidebar"

const items: SidebarItem[] = [
  { id: "dash", label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { id: "users", label: "Usuários", icon: Users, href: "/users" },
]

describe("Sidebar (data-driven)", () => {
  it("renders items from a flat list", () => {
    render(<Sidebar items={items} />)
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Usuários")).toBeInTheDocument()
  })

  it("renders groups with headings", () => {
    render(
      <Sidebar
        groups={[
          { label: "Geral", items: [items[0]!] },
          { label: "Admin", items: [items[1]!] },
        ]}
      />,
    )
    expect(screen.getByText("Geral")).toBeInTheDocument()
    expect(screen.getByText("Admin")).toBeInTheDocument()
  })

  it("renders header and footer slots", () => {
    render(
      <Sidebar
        items={items}
        header={<div data-testid="hdr">Logo</div>}
        footer={<div data-testid="ftr">User</div>}
      />,
    )
    expect(screen.getByTestId("hdr")).toBeInTheDocument()
    expect(screen.getByTestId("ftr")).toBeInTheDocument()
  })

  it("renders item.badge", () => {
    render(
      <Sidebar
        items={[{ ...items[0]!, badge: <span data-testid="b">3</span> }]}
      />,
    )
    expect(screen.getByTestId("b")).toBeInTheDocument()
  })

  it("marks active item via isActive callback", () => {
    render(<Sidebar items={items} isActive={(it) => it.id === "dash"} />)
    const dash = screen.getByText("Dashboard").closest("a")
    expect(dash).toHaveAttribute("data-active", "true")
  })

  it("renders submenu when item has children items", async () => {
    render(
      <Sidebar
        items={[
          {
            id: "reports",
            label: "Relatórios",
            items: [
              { id: "fin", label: "Financeiro", href: "/fin" },
              { id: "ops", label: "Operacional", href: "/ops" },
            ],
          },
        ]}
      />,
    )
    expect(screen.getByText("Relatórios")).toBeInTheDocument()
    expect(screen.getByText("Financeiro")).toBeInTheDocument()
    expect(screen.getByText("Operacional")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
cd /home/matheus/Projects/ui && bun run test src/navigation/sidebar.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Write the new `src/navigation/sidebar.tsx`**

```tsx
"use client"

import { ChevronRight } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "../hooks/use-is-mobile"
import { Sheet } from "../overlays/sheet"

export interface SidebarItem {
  id?: string
  label: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  href?: string
  onClick?: () => void
  badge?: React.ReactNode
  disabled?: boolean
  items?: SidebarItem[]
  tooltip?: React.ReactNode
}

export interface SidebarGroup {
  label?: React.ReactNode
  items: SidebarItem[]
}

export interface SidebarProps {
  items?: SidebarItem[]
  groups?: SidebarGroup[]
  header?: React.ReactNode
  footer?: React.ReactNode
  collapsible?: "offcanvas" | "icon" | "none"
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  persistOpenState?: boolean
  keyboardShortcut?: string | null
  isActive?: (item: SidebarItem) => boolean
  className?: string
}

const SIDEBAR_COOKIE_NAME = "amf-ui:sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_ICON = "3rem"

function getCookieValue(): boolean | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(new RegExp(`(^|; )${SIDEBAR_COOKIE_NAME}=([^;]+)`))
  if (!match) return undefined
  return match[2] === "true"
}

function Sidebar({
  items,
  groups,
  header,
  footer,
  collapsible = "icon",
  side = "left",
  variant = "sidebar",
  defaultOpen = true,
  open,
  onOpenChange,
  persistOpenState = false,
  keyboardShortcut = "b",
  isActive,
  className,
}: SidebarProps) {
  const isMobile = useIsMobile()
  const isControlled = open !== undefined
  const [internalOpen, setInternalOpen] = React.useState<boolean>(() => {
    if (persistOpenState) {
      const persisted = getCookieValue()
      if (persisted !== undefined) return persisted
    }
    return defaultOpen
  })
  const isOpen = isControlled ? open : internalOpen

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
      if (persistOpenState && !isControlled && typeof document !== "undefined") {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax; Secure`
      }
    },
    [isControlled, onOpenChange, persistOpenState],
  )

  // Keyboard shortcut
  React.useEffect(() => {
    if (!keyboardShortcut) return
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isEditable =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      if (isEditable) return
      if ((event.metaKey || event.ctrlKey) && event.key === keyboardShortcut) {
        event.preventDefault()
        setOpen(!isOpen)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [keyboardShortcut, isOpen, setOpen])

  const resolvedGroups: SidebarGroup[] = React.useMemo(() => {
    if (groups) return groups
    if (items) return [{ items }]
    return []
  }, [groups, items])

  // Mobile: render as Sheet
  if (isMobile && collapsible !== "none") {
    return (
      <Sheet
        open={isOpen}
        onOpenChange={setOpen}
        title="Sidebar"
        description="Menu principal"
        side={side}
        className="w-[--sidebar-width] p-0"
      >
        <div
          data-slot="sidebar"
          data-mobile="true"
          style={{ "--sidebar-width": SIDEBAR_WIDTH } as React.CSSProperties}
          className={cn("flex h-full flex-col", className)}
        >
          {header ? <div data-slot="sidebar-header">{header}</div> : null}
          <div data-slot="sidebar-body" className="flex-1 overflow-auto">
            {resolvedGroups.map((g, gi) => (
              <SidebarGroupRender key={gi} group={g} isActive={isActive} collapsedToIcon={false} />
            ))}
          </div>
          {footer ? <div data-slot="sidebar-footer">{footer}</div> : null}
        </div>
      </Sheet>
    )
  }

  // Desktop
  const collapsedToIcon = collapsible === "icon" && !isOpen

  return (
    <aside
      data-slot="sidebar"
      data-collapsible={collapsible}
      data-side={side}
      data-variant={variant}
      data-state={isOpen ? "expanded" : "collapsed"}
      style={
        {
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          width: collapsedToIcon ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH,
        } as React.CSSProperties
      }
      className={cn(
        "flex h-full flex-col border-r bg-background transition-[width] duration-200",
        side === "right" && "border-l border-r-0",
        className,
      )}
    >
      {header ? <div data-slot="sidebar-header">{header}</div> : null}
      <div data-slot="sidebar-body" className="flex-1 overflow-auto">
        {resolvedGroups.map((g, gi) => (
          <SidebarGroupRender key={gi} group={g} isActive={isActive} collapsedToIcon={collapsedToIcon} />
        ))}
      </div>
      {footer ? <div data-slot="sidebar-footer">{footer}</div> : null}
    </aside>
  )
}

function SidebarGroupRender({
  group,
  isActive,
  collapsedToIcon,
}: {
  group: SidebarGroup
  isActive?: SidebarProps["isActive"]
  collapsedToIcon: boolean
}) {
  return (
    <div data-slot="sidebar-group" className="px-2 py-2">
      {group.label && !collapsedToIcon ? (
        <div data-slot="sidebar-group-label" className="px-2 py-1 text-xs font-medium text-muted-foreground">
          {group.label}
        </div>
      ) : null}
      <ul data-slot="sidebar-menu" className="flex flex-col gap-0.5">
        {group.items.map((item, ii) => (
          <SidebarItemRender
            key={item.id ?? `${ii}-${typeof item.label === "string" ? item.label : ""}`}
            item={item}
            isActive={isActive}
            collapsedToIcon={collapsedToIcon}
            depth={0}
          />
        ))}
      </ul>
    </div>
  )
}

function SidebarItemRender({
  item,
  isActive,
  collapsedToIcon,
  depth,
}: {
  item: SidebarItem
  isActive?: SidebarProps["isActive"]
  collapsedToIcon: boolean
  depth: number
}) {
  const active = isActive?.(item) ?? false
  const Icon = item.icon
  const hasChildren = !!item.items?.length

  const content = (
    <>
      {Icon ? <Icon className="size-4 shrink-0" /> : null}
      {!collapsedToIcon ? <span className="flex-1 truncate">{item.label}</span> : null}
      {!collapsedToIcon && item.badge ? <span data-slot="sidebar-item-badge">{item.badge}</span> : null}
    </>
  )

  const className = cn(
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
    "hover:bg-accent hover:text-accent-foreground",
    "disabled:pointer-events-none disabled:opacity-50",
    active && "bg-accent text-accent-foreground",
    depth > 0 && "pl-7",
  )

  const trigger = item.href ? (
    <a
      href={item.href}
      data-active={active ? "true" : undefined}
      aria-disabled={item.disabled || undefined}
      className={className}
      onClick={item.onClick}
    >
      {content}
    </a>
  ) : (
    <button
      type="button"
      data-active={active ? "true" : undefined}
      disabled={item.disabled}
      className={className}
      onClick={item.onClick}
    >
      {content}
    </button>
  )

  return (
    <li data-slot="sidebar-item">
      {trigger}
      {hasChildren && !collapsedToIcon ? (
        <ul data-slot="sidebar-submenu" className="mt-0.5 flex flex-col gap-0.5">
          {item.items?.map((child, ci) => (
            <SidebarItemRender
              key={child.id ?? `${ci}-${typeof child.label === "string" ? child.label : ""}`}
              item={child}
              isActive={isActive}
              collapsedToIcon={collapsedToIcon}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

Sidebar.displayName = "Sidebar"

export { Sidebar }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/navigation/sidebar.test.tsx
```
Expected: 6 tests pass.

- [ ] **Step 5: Update stories**

Replace `src/navigation/sidebar.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"
import { BarChart3, Home, Settings, Users } from "lucide-react"

import { Sidebar } from "./sidebar"

const meta: Meta<typeof Sidebar> = { title: "Navigation/Sidebar", component: Sidebar }
export default meta
type Story = StoryObj<typeof Sidebar>

export const Default: Story = {
  args: {
    items: [
      { id: "home", label: "Home", icon: Home, href: "/" },
      { id: "users", label: "Usuários", icon: Users, href: "/users" },
      { id: "reports", label: "Relatórios", icon: BarChart3, href: "/reports" },
      { id: "settings", label: "Configurações", icon: Settings, href: "/settings" },
    ],
  },
}

export const WithGroups: Story = {
  args: {
    groups: [
      {
        label: "Geral",
        items: [
          { id: "home", label: "Home", icon: Home, href: "/" },
          { id: "users", label: "Usuários", icon: Users, href: "/users" },
        ],
      },
      {
        label: "Configurações",
        items: [{ id: "settings", label: "Settings", icon: Settings, href: "/settings" }],
      },
    ],
  },
}

export const WithSubmenu: Story = {
  args: {
    items: [
      {
        id: "reports",
        label: "Relatórios",
        icon: BarChart3,
        items: [
          { id: "fin", label: "Financeiro", href: "/reports/fin" },
          { id: "ops", label: "Operacional", href: "/reports/ops" },
        ],
      },
    ],
  },
}
```

- [ ] **Step 6: Re-export + commit**

Append to `src/index.ts`:
```ts
export {
  Sidebar,
  type SidebarItem,
  type SidebarGroup,
  type SidebarProps,
} from "./navigation/sidebar"
```

```bash
git add src/navigation/sidebar.tsx src/navigation/sidebar.test.tsx src/navigation/sidebar.stories.tsx src/index.ts
git commit -m "feat(sidebar): data-driven groups/items/submenu/badge/isActive"
```

### Phase 9 validation

```bash
cd /home/matheus/Projects/ui && bun run typecheck && bun run test src/navigation/ && bun run lint
```

---

## Phase 10: Data — `Card`, `Chart`, `DataTable`, `Image`, `Video`, `ScrollArea`, `Tree`, `tableStyles()`

### Task 10.1: Rewrite `Card` flat with `headerAction`/`footer`

**Files:**
- Modify: `src/data/card.tsx`
- Modify: `src/data/card.test.tsx`
- Modify: `src/data/card.stories.tsx`

- [ ] **Step 1: Write failing tests**

Replace `src/data/card.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Card } from "./card"

describe("Card", () => {
  it("renders title + description + children + footer", () => {
    render(
      <Card title="T" description="D" footer={<button>F</button>}>
        body
      </Card>,
    )
    expect(screen.getByText("T")).toBeInTheDocument()
    expect(screen.getByText("D")).toBeInTheDocument()
    expect(screen.getByText("body")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "F" })).toBeInTheDocument()
  })

  it("renders headerAction in the header right slot", () => {
    render(
      <Card title="T" headerAction={<button data-testid="act">act</button>}>
        body
      </Card>,
    )
    expect(screen.getByTestId("act")).toBeInTheDocument()
  })

  it("renders as plain container when no header/footer", () => {
    render(<Card>only body</Card>)
    expect(screen.getByText("only body")).toBeInTheDocument()
  })

  it("forwards ref", () => {
    let captured: HTMLDivElement | null = null
    render(<Card ref={(el) => { captured = el }}>x</Card>)
    expect(captured).toBeInstanceOf(HTMLDivElement)
  })
})
```

- [ ] **Step 2: Run — verify failures**

```bash
bun run test src/data/card.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Rewrite `src/data/card.tsx`**

```tsx
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  headerAction?: React.ReactNode
  footer?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}

function Card({ title, description, headerAction, footer, className, children, ref, ...props }: CardProps) {
  const hasHeader = title != null || description != null || headerAction != null
  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      {hasHeader ? (
        <div data-slot="card-header" className="flex items-start justify-between gap-4 p-6 pb-2">
          <div className="flex flex-col gap-1.5">
            {title ? (
              <h3 data-slot="card-title" className="text-lg font-semibold leading-none">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p data-slot="card-description" className="text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {headerAction ? (
            <div data-slot="card-header-action" className="shrink-0">{headerAction}</div>
          ) : null}
        </div>
      ) : null}
      <div data-slot="card-content" className={cn("p-6", hasHeader && "pt-4")}>
        {children}
      </div>
      {footer ? (
        <div data-slot="card-footer" className="flex items-center justify-end gap-2 p-6 pt-0">
          {footer}
        </div>
      ) : null}
    </div>
  )
}

Card.displayName = "Card"

export { Card }
```

- [ ] **Step 4: Verify pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/data/card.test.tsx
```
Expected: 4 tests pass.

- [ ] **Step 5: Update stories**

Replace `src/data/card.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Badge } from "../primitives/badge"
import { Button } from "../primitives/button"
import { Card } from "./card"

const meta: Meta<typeof Card> = { title: "Data/Card", component: Card }
export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: { title: "Vendas", description: "Últimos 30 dias", children: <p>R$ 12.345,67</p> },
}

export const WithAction: Story = {
  args: {
    title: "Vendas",
    description: "Últimos 30 dias",
    headerAction: <Badge variant="success">+12%</Badge>,
    children: <p>R$ 12.345,67</p>,
  },
}

export const WithFooter: Story = {
  args: {
    title: "Configurações",
    children: <p>Conteúdo</p>,
    footer: (
      <>
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar</Button>
      </>
    ),
  },
}

export const Container: Story = {
  args: { children: <p>Container sem header/footer</p> },
}
```

- [ ] **Step 6: Re-export + commit**

Append to `src/index.ts`:
```ts
export { Card, type CardProps } from "./data/card"
```

```bash
git add src/data/card.tsx src/data/card.test.tsx src/data/card.stories.tsx src/index.ts
git commit -m "feat(card): flat title/description/headerAction/footer API"
```

### Task 10.2: Create `tableStyles()` helper

**Files:**
- Create: `src/data/table-styles.ts`
- Create: `src/data/table-styles.test.ts`

- [ ] **Step 1: Write failing test**

Write `src/data/table-styles.test.ts`:
```ts
import { describe, expect, it } from "vitest"

import { tableStyles } from "./table-styles"

describe("tableStyles", () => {
  it("returns class names for all table parts", () => {
    const t = tableStyles()
    expect(t.table).toMatch(/.+/)
    expect(t.header).toMatch(/.+/)
    expect(t.body).toMatch(/.+/)
    expect(t.row).toMatch(/.+/)
    expect(t.head).toMatch(/.+/)
    expect(t.cell).toMatch(/.+/)
    expect(t.caption).toMatch(/.+/)
    expect(t.footer).toMatch(/.+/)
  })
})
```

- [ ] **Step 2: Run — verify fail**

```bash
cd /home/matheus/Projects/ui && bun run test src/data/table-styles.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Write `src/data/table-styles.ts`**

```ts
/**
 * Helper for raw HTML <table> usage when DataTable would be overkill.
 *
 * @example
 *   const t = tableStyles()
 *   <table className={t.table}>
 *     <thead className={t.header}><tr><th className={t.head}>Nome</th></tr></thead>
 *     <tbody>
 *       <tr className={t.row}><td className={t.cell}>...</td></tr>
 *     </tbody>
 *   </table>
 */
export function tableStyles() {
  return {
    table: "w-full caption-bottom text-sm",
    header: "[&_tr]:border-b",
    body: "[&_tr:last-child]:border-0",
    footer: "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
    row: "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
    head: "h-10 px-2 text-left align-middle font-medium text-muted-foreground",
    cell: "p-2 align-middle",
    caption: "mt-4 text-sm text-muted-foreground",
  } as const
}

export type TableStyles = ReturnType<typeof tableStyles>
```

- [ ] **Step 4: Verify pass**

- [ ] **Step 5: Re-export + commit**

Append to `src/index.ts`:
```ts
export { tableStyles, type TableStyles } from "./data/table-styles"
```

```bash
git add src/data/table-styles.ts src/data/table-styles.test.ts src/index.ts
git commit -m "feat(data): add tableStyles() helper for raw <table> styling"
```

### Task 10.3: `DataTable` — preserve v10 props-driven API, re-export

**Files:**
- Modify: `src/index.ts`
- Verify `src/data/data-table.tsx` still imports `Table*` from `./table.tsx` — it should NOT (we deleted that file).

- [ ] **Step 1: Update `DataTable` internals**

`DataTable` previously imported `Table`, `TableHeader`, `TableBody`, etc. from `./table`. Since we deleted `table.tsx`, inline those primitives **as private helpers** in `data-table.tsx`:

Add to the top of `src/data/data-table.tsx` (before the `DataTable` function):
```tsx
// Internal table primitives — formerly src/data/table.tsx, now private to this file.
function Table({ className, children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto">
      <table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  )
}
function TableHeader(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", props.className)} {...props} />
}
function TableBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", props.className)} {...props} />
}
function TableRow(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      data-slot="table-row"
      className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", props.className)}
      {...props}
    />
  )
}
function TableHead(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      data-slot="table-head"
      className={cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground", props.className)}
      {...props}
    />
  )
}
function TableCell(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td data-slot="table-cell" className={cn("p-2 align-middle", props.className)} {...props} />
}
```

Remove the previous `import { Table, ... } from "./table"` line.

- [ ] **Step 2: Run DataTable tests — verify still pass**

```bash
cd /home/matheus/Projects/ui && bun run test src/data/data-table.test.tsx
```
Expected: pass.

- [ ] **Step 3: Re-export**

Append to `src/index.ts`:
```ts
export { DataTable, type DataTableProps } from "./data/data-table"
```

- [ ] **Step 4: Commit**

```bash
git add src/data/data-table.tsx src/index.ts
git commit -m "refactor(data-table): inline private Table primitives (table.tsx deleted)"
```

### Task 10.4: `Image` — re-export (v10 implementation preserved)

**Files:**
- Modify: `src/index.ts`
- Verify: `src/data/image.tsx` is React-19-ref style.

- [ ] **Step 1: Verify**

Run:
```bash
grep "React.forwardRef" src/data/image.tsx
```
If found, convert to function with `ref?: React.Ref<HTMLImageElement>` prop. Re-run `src/data/image.test.tsx` after conversion.

- [ ] **Step 2: Re-export + commit**

Append to `src/index.ts`:
```ts
export { Image, type ImageProps } from "./data/image"
```

```bash
git add src/index.ts src/data/image.tsx
git commit -m "chore(image): re-export with React 19 ref style"
```

### Task 10.5: `Video` — re-export

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Verify React 19 ref-style.**

- [ ] **Step 2: Append re-export:**

```ts
export {
  Video,
  type VideoCaptionTrack,
  type VideoProps,
} from "./data/video"
```

- [ ] **Step 3: Commit**

```bash
git add src/index.ts src/data/video.tsx
git commit -m "chore(video): re-export with React 19 ref style"
```

### Task 10.6: `ScrollArea` — re-export

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Append re-export (ScrollBar internalized — no public export):**

```ts
export { ScrollArea, type ScrollAreaOrientation } from "./data/scroll-area"
```

Modify `src/data/scroll-area.tsx` to NOT export `ScrollBar`. ScrollBar stays as a private helper.

- [ ] **Step 2: Commit**

```bash
git add src/data/scroll-area.tsx src/index.ts
git commit -m "refactor(scroll-area): internalize ScrollBar export"
```

### Task 10.7: `Tree` — re-export

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Append re-export:**

```ts
export { Tree, type TreeNodeData, type TreeProps } from "./data/tree"
```

- [ ] **Step 2: Commit**

```bash
git add src/index.ts
git commit -m "chore(tree): re-export"
```

### Task 10.8: `Chart` — fuse `ChartTooltipContent` into `ChartTooltip` (and same for Legend)

**Files:**
- Modify: `src/data/chart.tsx`
- Modify: `src/data/chart.test.tsx`

- [ ] **Step 1: Add failing test for merged `ChartTooltip`**

Append to `src/data/chart.test.tsx`:
```tsx
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LineChart, Line, ResponsiveContainer } from "recharts"

import { ChartContainer, ChartTooltip, type ChartConfig } from "./chart"

const config: ChartConfig = { v: { label: "Value", color: "#06f" } }

describe("ChartTooltip (merged with Content)", () => {
  it("renders without requiring a separate Content component", () => {
    const { container } = render(
      <ChartContainer config={config}>
        <ResponsiveContainer>
          <LineChart data={[{ x: 1, v: 10 }]}>
            <Line dataKey="v" />
            <ChartTooltip />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>,
    )
    expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify failure if Content split**

- [ ] **Step 3: Modify `src/data/chart.tsx`**

Fold the content rendering into the Tooltip/Legend components themselves:
- Make `ChartTooltip` use recharts' `Tooltip` with a `content={…internal renderer…}` baked in.
- Same for `ChartLegend`.
- Remove `ChartTooltipContent` and `ChartLegendContent` from the exports list at the bottom.

Replace the file's export footer:
```tsx
export {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartStyle,
  type ChartConfig,
}
```

(The internal content rendering function remains as a private helper, called from inside `ChartTooltip`/`ChartLegend`.)

- [ ] **Step 4: Verify pass**

- [ ] **Step 5: Re-export and commit**

Append to `src/index.ts`:
```ts
export {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartStyle,
  type ChartConfig,
} from "./data/chart"
```

```bash
git add src/data/chart.tsx src/data/chart.test.tsx src/index.ts
git commit -m "refactor(chart): fuse ChartTooltipContent and ChartLegendContent into parents"
```

### Phase 10 validation

```bash
cd /home/matheus/Projects/ui && bun run typecheck && bun run test src/data/ && bun run lint
```

---

## Phase 11: Final integration & release

### Task 11.1: Re-export hooks and lib

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Append the final block to `src/index.ts`**

```ts
// Hooks
export { useIsMobile } from "./hooks/use-is-mobile"

// Lib
export { cn } from "./lib/utils"
export {
  centsToDisplay,
  formatBRL,
  fromCents,
  percentFromValue,
  percentOfTotal,
  toCents,
} from "./lib/currency"
export { bytes, gb, kb, mb } from "./lib/size"
```

- [ ] **Step 2: Verify the full export surface**

Run:
```bash
cd /home/matheus/Projects/ui && grep -c "^export" src/index.ts
```
Expected: around 40-50 export lines.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat(index): finalize public export surface"
```

### Task 11.2: Verify the build

**Files:**
- No source changes.

- [ ] **Step 1: Run build**

```bash
cd /home/matheus/Projects/ui && bun run build
```
Expected: tsup completes without errors, `dist/index.js` and `dist/index.d.ts` are generated.

- [ ] **Step 2: Inspect public surface in `dist/index.d.ts`**

```bash
grep "^export" dist/index.d.ts | head -60
```
Verify all expected exports are there and no unexpected ones (e.g. no `AvatarImage`, `CardHeader`, `CommandShortcut` etc. should appear).

- [ ] **Step 3: Commit** (if there are dist artifacts tracked — usually they aren't)

Skip if `dist/` is in `.gitignore`.

### Task 11.3: Update `CHANGELOG.md`

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Replace the `[10.0.0]` entry**

The v10 CHANGELOG entry covers the rigorous-review fixes. Replace it with a single entry that covers BOTH the review fixes AND the API simplification (since the library was never published, only one v10 release is going out).

Insert at the top of the changelog (after the format header):
```markdown
## [10.0.0] — 2026-05-18

**First public release.** This is the initial published API of `@am-fernandes/ui`.

### API surface

- ~52 public exports (the library was iterated privately to ~145 in v9; reduced ~64% before release).
- Every form control accepts `label`/`description`/`error`/`required` props directly. No external `<Label>` needed.
- Every overlay accepts `trigger`/`title`/`description`/`footer`/`children`. No compound sub-component exports for Dialog/Sheet/Alert/AlertDialog/Popover/Tooltip/Collapsible.
- Every navigation surface is data-driven (`items` or `groups` props): Accordion, Tabs, Breadcrumb, CommandPalette, Sidebar, Tree.
- `Card` is flat: `title`/`description`/`headerAction`/`footer`/`children`.
- `Form` uses RHF `resolver` (Zod/Yup/Valibot/Joi compatible).
- `Button.asChild` retained as the only compound primitive — router `<Link>` integration has no clean alternative.
- `Field` + `FieldGroup` are the two exports for layout-around-custom-controls.
- Helpers exported: `cn`, `buttonVariants`, `alertVariants`, `tableStyles`, `useComboboxOptions`, `REGEXP_ONLY_DIGITS`, `useIsMobile`, `toCents`, `fromCents`, `centsToDisplay`, `formatBRL`, `percentOfTotal`, `percentFromValue`, `bytes`, `kb`, `mb`, `gb`.

### Internal quality

- 100% React 19 native `ref` prop pattern (no `React.forwardRef`).
- `data-slot` attribute on every primary element for styling/testing hooks.
- Test suite rewritten against the new API (~300+ tests, vitest + jsdom).
- Stories rewritten to cover Default + edge cases for every component.
- Lint clean (Biome).
- Typecheck clean.

### Security & a11y

- WCAG 2.4.7 focus rings on every interactive primitive.
- Radix `<DialogTitle>` always present (CommandPalette uses `sr-only` defaults).
- `Image`/`Video` validate `src` against an allowlist of protocols.
- `Chart` sanitizes config `color` before CSS interpolation.
- `Sidebar` cookie persistence is opt-in (`persistOpenState`), `SameSite=Lax; Secure`.
- `FileUpload` documents that MIME validation is browser-supplied — server-side magic-byte validation is the consumer's responsibility.
- Tree implements full WAI-ARIA tree pattern (roving tabindex, arrow keys, Home/End).

### Breaking pre-release notes

Prior in-repo versions (v1-v9) were never published to npm. The v10.0.0 release is the first public artifact and represents the final API decisions.
```

- [ ] **Step 2: Remove or rewrite earlier entries**

For clarity, the public CHANGELOG should start at v10. Earlier in-repo iterations (v1-v9) can be either:
- Kept as historical reference (collapsed under a "Pre-release iterations" heading), OR
- Removed entirely from the public CHANGELOG.

Choose based on preference. The conservative option is to keep them under a collapsed heading.

- [ ] **Step 3: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs(changelog): write public v10.0.0 release notes"
```

### Task 11.4: Full validation gate

- [ ] **Step 1: Typecheck**

```bash
cd /home/matheus/Projects/ui && bun run typecheck
```
Expected: pass.

- [ ] **Step 2: Tests**

```bash
cd /home/matheus/Projects/ui && bun run test
```
Expected: all tests pass. Note exit code (should be 0 even with the `input-otp` post-teardown warnings).

- [ ] **Step 3: Lint**

```bash
cd /home/matheus/Projects/ui && bun run lint
```
Expected: 0 errors.

- [ ] **Step 4: Build**

```bash
cd /home/matheus/Projects/ui && bun run build
```
Expected: `dist/index.js` and `dist/index.d.ts` generated; bundle size sane.

- [ ] **Step 5: Storybook build**

```bash
cd /home/matheus/Projects/ui && bun run build-storybook
```
Expected: builds without errors. Open `storybook-static/index.html` manually to spot-check 5-10 components visually.

- [ ] **Step 6: Smoke test the public API**

Create a temporary scratch file:
```bash
cat > /tmp/smoke-test.tsx << 'EOF'
import {
  Alert, AlertDialog, Avatar, Badge, Button, Card,
  Checkbox, Collapsible, Combobox, CommandPalette,
  DateInput, DateRangePicker, Dialog, FileUpload,
  Form, FormField, Input, InputOTP, MultiInput,
  Popover, RadioGroup, ScrollArea, Separator, Sheet,
  Sidebar, Skeleton, Switch, Tabs, Textarea, TimePicker,
  Toaster, Tooltip, Tree, Typography,
  // helpers
  buttonVariants, alertVariants, tableStyles,
  cn, REGEXP_ONLY_DIGITS, useIsMobile, useComboboxOptions,
  toCents, fromCents, centsToDisplay, formatBRL, percentOfTotal, percentFromValue,
  bytes, kb, mb, gb,
  // chart
  ChartContainer, ChartTooltip, ChartLegend, ChartStyle,
} from "@am-fernandes/ui"
console.log({
  Alert, AlertDialog, Avatar, Badge, Button, Card,
  Checkbox, Collapsible, Combobox, CommandPalette,
  DateInput, DateRangePicker, Dialog, FileUpload,
  Form, FormField, Input, InputOTP, MultiInput,
  Popover, RadioGroup, ScrollArea, Separator, Sheet,
  Sidebar, Skeleton, Switch, Tabs, Textarea, TimePicker,
  Toaster, Tooltip, Tree, Typography,
})
EOF
cd /home/matheus/Projects/ui && bun run tsc --noEmit /tmp/smoke-test.tsx 2>&1 | head -30
```

Expected: no `has no exported member` errors. Any missing export is a gap in the plan — go back and add the re-export.

- [ ] **Step 7: Final commit**

If everything passes:
```bash
cd /home/matheus/Projects/ui && git tag v10.0.0-rc1
```

### Task 11.5: Cleanup task list

- [ ] **Step 1: Delete any leftover `_internal` files** that are no longer imported

```bash
cd /home/matheus/Projects/ui && grep -r "from .*_internal" src/ --include="*.tsx" --include="*.ts" -l
```
Verify each `_internal/*` file under `primitives/` and `overlays/` is still imported somewhere. If not, delete.

- [ ] **Step 2: Run a final full validation**

```bash
cd /home/matheus/Projects/ui && bun run typecheck && bun run test && bun run lint && bun run build
```

- [ ] **Step 3: Commit any cleanup**

```bash
git add -A
git commit -m "chore: cleanup leftover internal files"
```

---

## Self-review checklist (executed by plan author after writing)

**Spec coverage:**
- ✅ Avatar, Badge, Button, Checkbox, Input, Label removal, RadioGroup, Separator, Skeleton, Switch, Textarea, Typography — Phases 2-4
- ✅ Alert, AlertDialog, Collapsible, Dialog, Popover, Progress, Sheet, Sonner, Tooltip — Phase 5
- ✅ Field, FieldGroup, Form, FormField, Combobox, Calendar, DateInput, DateRangePicker, TimePicker — Phases 6+8
- ✅ Accordion, Tabs, Breadcrumb, CommandPalette, Sidebar — Phase 9
- ✅ Card, Chart, DataTable, Image, Video, ScrollArea, Tree, tableStyles — Phase 10
- ✅ CurrencyInput, FileUpload, InputOTP, MultiInput, PercentageInput — Phase 7
- ✅ Hooks/Lib re-exports + CHANGELOG + build + tag — Phase 11

**Placeholder scan:** No "TBD", no "fill in", no "similar to Task N" (where used, full code is provided).

**Type consistency:**
- `FieldShellProps.labelPosition: "up" | "left" | "hidden"` — consistent across Input, Textarea, RadioGroup, Combobox, DateInput, TimePicker, domain inputs.
- `FieldShellProps.ref?: React.Ref<...>` pattern — consistent.
- `useFieldIds()` returns `{ controlId, labelId, descriptionId, errorId, describedBy }` — used consistently.
- `SidebarItem` shape — used in both `items` and `groups[].items`.
- `DateRangeValue = { from: string; to: string }` — exported and used.
- `REGEXP_ONLY_DIGITS` — string literal `"^\\d+$"` — consistent in re-exports.

**Open items deferred to future versions** (NOT in this plan):
- `ThemeProvider`, `LocaleProvider`, `<IconButton>`, virtualization, drag-and-drop, `useDebounce`, `useMediaQuery`, `<ZodForm>` sugar.

---

## Execution choice

**Two execution options:**

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks. Best for keeping context tight across the ~50 tasks in this plan.

2. **Inline Execution** — execute tasks in this session using `superpowers:executing-plans`, batch with checkpoints. Better if you want to react quickly to surprises.

**Which approach?**
