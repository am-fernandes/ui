# `@am-fernandes/ui` — Phase 6: Domain AM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Ship 4 AM-Fernandes-specific domain components — currency-input, percentage-input, days-installment-input, input-otp — plus the supporting `lib/currency.ts` helper module. Release as `v0.5.0`.

**Architecture:** Components in `src/domain/`. Currency math helper in `src/lib/currency.ts` (re-exported from the public barrel). Sources from `requerimento-contratos-pf` (3 components + currency lib) and `am-fernandes/assistencia-tecnica` (input-otp).

**Sources:**
- `/home/matheus/Projects/requerimento-contratos-pf/src/lib/currency.ts`
- `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/{currency-input,percentage-input,days-installment-input}.tsx`
- `am-fernandes/assistencia-tecnica`: `packages/web/src/components/ui/input-otp.tsx` (fetch via `gh api`)

**New deps:**
```
input-otp ^1.4.2
```

## Conventions

- Flat layout `src/domain/<name>.tsx` + `<name>.stories.tsx`.
- `lib/currency.ts` lives at `src/lib/currency.ts` (alongside `utils.ts`).
- Strip `dark:` classes (none expected in these sources; verify).
- Keep `"use client"`, `data-slot`, `displayName`, `forwardRef`.
- Import rewrites:
  - `@/lib/utils` → keep alias (works)
  - `@/lib/currency` → keep alias (works; resolves to our new file)
  - `@/components/ui/badge` → `../primitives/badge`
- CSF3 `title: "Domain/<Name>"`, `tags: ["autodocs"]`, `layout: "centered"`.
- Append `"Domain"` to `.storybook/preview.tsx` `storySort.order` after `"Forms"`.
- Append exports to `src/index.ts` under `// Domain` block. Also re-export currency helpers under a `// Lib` block.
- One commit per component, one for the lib, one for setup.

## Tasks

### Task 0: deps + sort + lib

- Add `"input-otp": "^1.4.2"` to `package.json#dependencies`.
- `bun install`.
- Add `"Domain"` to `storySort.order` after `"Forms"`.
- **Copy `src/lib/currency.ts`** from the requerimento source — direct copy. Append re-exports to `src/index.ts` under a new `// Lib` block:
  ```ts
  // Lib
  export {
    toCents,
    fromCents,
    centsToDisplay,
    percentOfTotal,
    percentFromValue,
    // …any other public exports the source defines
  } from "./lib/currency"
  ```
  (Read the source's actual `export` block before listing.)
- Verify gates green.
- Single commit: `chore(deps): add input-otp + currency helper for Phase 6`.

### Task 1: currency-input

Read source. Direct copy. Uses currency helpers from `@/lib/currency`.

Exports: `CurrencyInput` (and any sub-types).

Story `Default` (`render: () => (...)`): a labeled CurrencyInput with `useState<number>(0)` for value. Label "Valor do contrato (R$)".

Commit: `feat(domain): add currency-input`.

### Task 2: percentage-input

Read source. Direct copy.

Exports: `PercentageInput` (and sub-types).

Story `Default`: labeled PercentageInput with local state. Label "Comissão (%)".

Commit: `feat(domain): add percentage-input`.

### Task 3: days-installment-input

Read source. Imports Badge — rewrite to `../primitives/badge`.

Exports: `DaysInstallmentInput` (and sub-types).

Story `Default`: with `useState<number[]>([30, 60, 90])` for installments.

Commit: `feat(domain): add days-installment-input`.

### Task 4: input-otp

Fetch source: `gh api repos/am-fernandes/assistencia-tecnica/contents/packages/web/src/components/ui/input-otp.tsx --jq '.content' | base64 -d > /tmp/input-otp-source.tsx`. Read `/tmp/input-otp-source.tsx`.

Direct copy. Uses `input-otp` package (already declared in deps) and `MinusIcon` from `lucide-react`.

Exports: `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator` (verify against source).

Story `Default`: `<InputOTP maxLength={6}>` with two `<InputOTPGroup>` of 3 slots each, separated by `<InputOTPSeparator />`.

Commit: `feat(domain): add input-otp`.

### Task 5: Verify + bump + tag

- All gates green.
- `grep -o '"Domain/[^"]*"' storybook-static/index.json | sort -u | wc -l` → 4.
- Bump `package.json#version` to `0.5.0`. Commit `chore(release): bump version to 0.5.0 for Phase 6`.
- Tag `v0.5.0` "Phase 6: 4 AM domain components (currency-input, percentage-input, days-installment-input, input-otp) + lib/currency".

## Risks

- The `currency-input.tsx` source depends on three named exports from `currency.ts` (`toCents`, `fromCents`, `centsToDisplay`). After copying `currency.ts`, ensure those exports exist — the source has them per inspection. Other helpers (`percentOfTotal`, `percentFromValue`) may be used by `percentage-input.tsx`; verify imports.
- `lib/currency.ts` is re-exported from the public barrel — consumers can do `import { toCents } from "@am-fernandes/ui"`. This is intentional (financial logic is a peer concern to the form components).
