# `@am-fernandes/ui` — Phase 2: Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 11 primitive components — button, input, label, textarea, checkbox, switch, radio-group, badge, separator, skeleton, avatar — as `@am-fernandes/ui@0.1.0`. Each component has a story; barrel exports the public API. Storybook sidebar gains a "Primitives" section.

**Architecture:** Components live flat under `src/primitives/`, each a single `.tsx` file paired with `.stories.tsx`. Sources are copied verbatim from `requerimento-contratos-pf/src/components/ui/*` (10 of 11) and `am-fernandes/assistencia-tecnica/packages/web/src/components/ui/radio-group.tsx` (1 of 11), then adapted: strip `dark:` classes (light only), keep `@/lib/utils` path alias (already configured), preserve `data-slot` attributes and existing variant APIs. Phase 2 ships Button **without** the `confirm`/`confirmTitle`/etc. props — those depend on `AlertDialog`, which lands in Phase 3.

**Tech Stack:** Bun, React 19, Tailwind v4, Radix UI primitives (`@radix-ui/react-{slot,label,checkbox,switch,separator,avatar,radio-group}`), `class-variance-authority`, `lucide-react`, Storybook 10.

**Spec reference:** `docs/superpowers/specs/2026-05-16-am-fernandes-ui-design.md`

**Source files in this repo:**
- `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/{button,input,label,textarea,checkbox,switch,badge,separator,skeleton,avatar}.tsx`
- `assistencia-tecnica` repo (via `gh api`): `packages/web/src/components/ui/radio-group.tsx`

**Scope of this plan:** Phase 2 only. Phase 3 (overlays/feedback) and onward get their own plans.

---

## Conventions

### File layout

Flat under `src/primitives/`. No folder-per-component (most primitives are <30 lines; a folder is overhead).

```
src/primitives/
├── avatar.tsx        + avatar.stories.tsx
├── badge.tsx         + badge.stories.tsx
├── button.tsx        + button.stories.tsx
├── checkbox.tsx      + checkbox.stories.tsx
├── input.tsx         + input.stories.tsx
├── label.tsx         + label.stories.tsx
├── radio-group.tsx   + radio-group.stories.tsx
├── separator.tsx     + separator.stories.tsx
├── skeleton.tsx      + skeleton.stories.tsx
├── switch.tsx        + switch.stories.tsx
└── textarea.tsx      + textarea.stories.tsx
```

### Adaptation rules (every component task applies these)

1. **Copy** from the source path listed in the per-component task. Do not retype from memory.
2. **Keep** the `@/lib/utils` import path — it's aliased in `tsconfig.json` (`"@/*": ["./src/*"]`). No relative-path conversion needed.
3. **Strip every `dark:` class** from `className` strings. Search-and-replace `\sdark:[a-z0-9-/[\]]+` → empty. Don't strip the word `dark` if it's part of a slot name or unrelated identifier. (The 10 requerimento sources are already clean; the assistencia `radio-group.tsx` has `dark:` classes that MUST be removed.)
4. **Keep** `"use client"` directives where the source has them (Label has one; Button does in requerimento — needed for React Server Components compatibility downstream).
5. **Keep** `data-slot="..."` attributes — they're used by composed components for selectors (e.g., `field.tsx` selects via `[data-slot=checkbox-group]`).
6. **Keep** `displayName` assignments.
7. **Keep** `forwardRef` patterns where present.
8. **Replace** `import { cn } from "@/lib/utils"` exactly as-is (don't rewrite the helper).
9. **Lint after each component:** `bun run lint`. If Biome auto-fixes formatting (import sorting, etc.), accept the auto-fix — it's the project standard.
10. **Each component is its own commit** with message `feat(primitives): add <name>` (e.g., `feat(primitives): add button`).

### Stories convention (CSF3)

Template every story file follows:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite"
import { ComponentName } from "./<name>"

const meta = {
  title: "Primitives/ComponentName",
  component: ComponentName,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ComponentName>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { /* args */ }
// Additional stories per variant / state…
```

Minimum stories per primitive (more allowed if useful):

| Primitive | Required stories |
|---|---|
| button | `Default`, `Variants` (one of each: default/destructive/outline/secondary/ghost/link), `Sizes` (sm/default/lg/icon), `WithIcon`, `Disabled` |
| input | `Default`, `Disabled`, `WithPlaceholder`, `Types` (text/email/number/password) |
| label | `Default`, `WithInput` (composed example with Input) |
| textarea | `Default`, `Disabled`, `WithRows` |
| checkbox | `Default`, `Checked`, `Disabled`, `WithLabel` |
| switch | `Default`, `Checked`, `Disabled`, `WithLabel` |
| radio-group | `Default` (3 options), `WithLabels`, `Disabled` |
| badge | `Default`, `Variants` (default/secondary/destructive/outline) |
| separator | `Horizontal`, `Vertical` |
| skeleton | `Default`, `Card` (composed example: avatar + two lines) |
| avatar | `WithImage`, `Fallback` (no image, shows initials) |

### Barrel exports (`src/index.ts`)

After each component commit, add its named exports to `src/index.ts`. Pattern:

```ts
export { cn } from "./lib/utils"

export { Button, buttonVariants, type ButtonProps } from "./primitives/button"
export { Input } from "./primitives/input"
// ...
```

Only export the public API (components + their variant builders + Props types). Internal helpers stay unexported.

### Storybook sidebar order

Update `.storybook/preview.tsx`'s `storySort.order` to insert Primitives between "Foundations" and the (future) "Components":

```ts
order: [
  "Getting Started",
  "Foundations",
  ["Colors", "Typography", "Spacing", "Radius", "Iconography"],
  "Primitives",
]
```

This is done **once** in Task 0; not per component.

---

## Task 0: Install deps + update Storybook sort

**Files:**
- Modify: `package.json`
- Modify: `bun.lock` (generated)
- Modify: `.storybook/preview.tsx`

- [ ] **Step 1: Add new dependencies**

These primitives need the following new runtime deps. Add to `package.json#dependencies`:

```
"@radix-ui/react-avatar": "^1.1.11",
"@radix-ui/react-checkbox": "^1.3.3",
"@radix-ui/react-label": "^2.1.7",
"@radix-ui/react-radio-group": "^1.3.8",
"@radix-ui/react-separator": "^1.1.8",
"@radix-ui/react-slot": "^1.2.3",
"@radix-ui/react-switch": "^1.2.6",
"class-variance-authority": "^0.7.1",
"lucide-react": "^0.545.0"
```

Note: versions chosen to match `requerimento-contratos-pf`'s `package.json` exactly. `lucide-react` is a **runtime dep** here (Checkbox and RadioGroup use icons from it internally), not just a story dep.

`tailwind-merge` and `clsx` already declared from Phase 1 — don't re-add.

- [ ] **Step 2: Install**

```bash
cd /home/matheus/Projects/ui
bun install
```

Expected: `node_modules/` updated, `bun.lock` updated, no errors. Spot-check `node_modules/@radix-ui/react-slot/package.json` exists.

- [ ] **Step 3: Update `.storybook/preview.tsx`**

In the existing `storySort.order` array, append `"Primitives"` after the Foundations nested array:

```ts
order: [
  "Getting Started",
  "Foundations",
  ["Colors", "Typography", "Spacing", "Radius", "Iconography"],
  "Primitives",
]
```

- [ ] **Step 4: Verify**

```bash
bun run typecheck   # exit 0
bun run lint        # exit 0
bun run build-storybook   # exit 0
```

- [ ] **Step 5: Commit**

```bash
git add package.json bun.lock .storybook/preview.tsx
git commit -m "chore(deps): add Radix primitives, CVA, lucide-react for Phase 2"
```

---

## Tasks 1–11: One primitive per task

Each task follows the same five steps:

1. Read source file
2. Adapt (strip `dark:`, verify imports)
3. Write `src/primitives/<name>.tsx`
4. Write `src/primitives/<name>.stories.tsx` per the conventions table above
5. Add export to `src/index.ts`; typecheck + lint; commit

Per-component source paths are listed below. **Do not paste source content into commit messages; reference the upstream file.**

### Task 1: Button

**Source:** `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/button.tsx`

**Source-specific adaptations beyond the global rules:**
- The requerimento Button has **two responsibilities**: rendering a button and conditionally wrapping it in an `AlertDialog` when `confirm`-related props are set. **Phase 2 ships only the button rendering.** Strip:
  - All confirm-related props (`confirm`, `confirmTitle`, `confirmMessage`, `confirmActionLabel`, `confirmCancelLabel`, etc.)
  - All confirm-related state (any `useState` for open/close)
  - The conditional `<AlertDialog>` JSX wrapper
  - The `AlertTriangle` import from `lucide-react` (was used in the confirm dialog)
  - All imports from `@/components/ui/alert-dialog`
- Keep: `cva` definition (`buttonVariants`), all `variant`/`size` options, `asChild` prop using `@radix-ui/react-slot`, `forwardRef`, `displayName`.
- Resulting file should be ~55 lines. The confirm feature will be re-added in Phase 3 as a separate component (`ConfirmButton`) or re-introduced once AlertDialog ships.

**Public exports:** `Button`, `buttonVariants`, `type ButtonProps`.

**Storybook file:** `src/primitives/button.stories.tsx` per template. Stories listed in conventions table.

**Commit:** `feat(primitives): add button (without confirm flow)`

---

### Task 2: Input

**Source:** `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/input.tsx`

**Adaptations:** Direct copy. No `dark:` classes. ~22 lines.

**Public exports:** `Input`.

**Stories:** per template (`Default`, `Disabled`, `WithPlaceholder`, `Types`).

**Commit:** `feat(primitives): add input`

---

### Task 3: Label

**Source:** `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/label.tsx`

**Adaptations:** Direct copy. Keeps `"use client"`. ~26 lines.

**Public exports:** `Label`.

**Stories:** `Default`, `WithInput` (compose with Input from Task 2 — import via relative `./input`).

**Commit:** `feat(primitives): add label`

---

### Task 4: Textarea

**Source:** `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/textarea.tsx`

**Adaptations:** Direct copy. ~22 lines.

**Public exports:** `Textarea`.

**Stories:** `Default`, `Disabled`, `WithRows` (use `rows={6}` arg).

**Commit:** `feat(primitives): add textarea`

---

### Task 5: Checkbox

**Source:** `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/checkbox.tsx`

**Adaptations:** Direct copy. Uses `Check` icon from `lucide-react` (already installed in Task 0). ~30 lines.

**Public exports:** `Checkbox`.

**Stories:** `Default`, `Checked` (with `defaultChecked` arg), `Disabled`, `WithLabel` (compose with Label).

**Commit:** `feat(primitives): add checkbox`

---

### Task 6: Switch

**Source:** `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/switch.tsx`

**Adaptations:** Direct copy. ~29 lines.

**Public exports:** `Switch`.

**Stories:** `Default`, `Checked`, `Disabled`, `WithLabel` (compose with Label).

**Commit:** `feat(primitives): add switch`

---

### Task 7: Radio Group

**Source:** Fetch via `gh api repos/am-fernandes/assistencia-tecnica/contents/packages/web/src/components/ui/radio-group.tsx --jq '.content' | base64 -d`

**Adaptations:**
- **Strip every `dark:` class** — this source has several (`dark:aria-invalid:ring-destructive/40`, `dark:bg-input/30`). Audit the className strings on `RadioGroupPrimitive.Item` carefully.
- Otherwise direct copy. Uses `CircleIcon` from `lucide-react`.

**Public exports:** `RadioGroup`, `RadioGroupItem`.

**Stories:** `Default` (3 options via map), `WithLabels` (compose Label + Input for option labels), `Disabled`.

**Commit:** `feat(primitives): add radio-group`

---

### Task 8: Badge

**Source:** `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/badge.tsx`

**Adaptations:** Direct copy. ~36 lines. Uses `cva`.

**Public exports:** `Badge`, `badgeVariants`, `type BadgeProps`.

**Stories:** `Default`, `Variants` (one of each: default/secondary/destructive/outline).

**Commit:** `feat(primitives): add badge`

---

### Task 9: Separator

**Source:** `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/separator.tsx`

**Adaptations:** Direct copy. ~31 lines.

**Public exports:** `Separator`.

**Stories:** `Horizontal` (default), `Vertical` (with `orientation="vertical"` and height set in a wrapping div for visibility).

**Commit:** `feat(primitives): add separator`

---

### Task 10: Skeleton

**Source:** `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/skeleton.tsx`

**Adaptations:** Direct copy. ~15 lines.

**Public exports:** `Skeleton`.

**Stories:** `Default` (single rectangle), `Card` (composes 3 Skeletons: round avatar + 2 lines of varying widths).

**Commit:** `feat(primitives): add skeleton`

---

### Task 11: Avatar

**Source:** `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/avatar.tsx`

**Adaptations:** Direct copy. ~50 lines.

**Public exports:** `Avatar`, `AvatarImage`, `AvatarFallback`.

**Stories:**
- `WithImage` — use `https://github.com/shadcn.png` as a stable test image URL (already public, used widely in shadcn docs).
- `Fallback` — no image src; `AvatarFallback` shows "AM".

**Commit:** `feat(primitives): add avatar`

---

## Task 12: Final verification

**Files:** none modified.

- [ ] **Step 1: Confirm all 11 primitive files exist**

```bash
ls src/primitives/*.tsx | wc -l
```

Expected: `22` (11 components + 11 stories).

- [ ] **Step 2: Confirm barrel exports**

```bash
cat src/index.ts
```

Expected: `cn` plus 11 component exports (Button + buttonVariants + ButtonProps, Input, Label, Textarea, Checkbox, Switch, RadioGroup + RadioGroupItem, Badge + badgeVariants + BadgeProps, Separator, Skeleton, Avatar + AvatarImage + AvatarFallback).

- [ ] **Step 3: Full pipeline**

```bash
bun run typecheck       # exit 0
bun run lint            # exit 0
bun run build           # exit 0; dist/index.js grows to ~50–80 KB
bun run build-storybook # exit 0
```

- [ ] **Step 4: Verify Storybook indexes Primitives**

```bash
grep -o '"Primitives/[^"]*"' storybook-static/index.json | sort -u
```

Expected: 11 entries, one per primitive (`Primitives/Button`, `Primitives/Input`, etc.).

- [ ] **Step 5: Smoke-test dev server**

```bash
bun run storybook &
SB_PID=$!
sleep 12
curl -sSf http://localhost:6006/index.json | grep -c '"Primitives/' # expect 11
kill $SB_PID
wait $SB_PID 2>/dev/null
```

- [ ] **Step 6: No commit (verification only).**

---

## Task 13: Tag release `0.1.0`

- [ ] **Step 1: Bump version in `package.json`**

```diff
- "version": "0.0.1",
+ "version": "0.1.0",
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore(release): bump version to 0.1.0 for Phase 2"
```

- [ ] **Step 3: Tag**

```bash
git tag -a v0.1.0 -m "Phase 2: 11 primitives (button, input, label, textarea, checkbox, switch, radio-group, badge, separator, skeleton, avatar)"
```

- [ ] **Step 4: Confirm log**

```bash
git log --oneline -15
git tag -l
```

Expected: 13 new commits since `b1b62e4` (1 chore-deps + 11 component commits + 1 version-bump). Two tags total: `v0.0.1`, `v0.1.0`.

---

## Self-Review

**Spec coverage (Phase 2 scope):**

| Spec primitive | Plan task |
|---|---|
| button (11 primitives total in spec) | Task 1 |
| input | Task 2 |
| label | Task 3 |
| textarea | Task 4 |
| checkbox | Task 5 |
| switch | Task 6 |
| radio-group | Task 7 |
| badge | Task 8 |
| separator | Task 9 |
| skeleton | Task 10 |
| avatar | Task 11 |

11 of 11 primitives covered. Button's `confirm` feature explicitly deferred to Phase 3 (documented in Task 1 and in the architecture note above).

**Placeholder scan:** No "TBD"/"TODO" patterns. Per-task content references source files; subagents will read those files directly rather than work from pasted code (cleaner, smaller plan, single source of truth).

**Type consistency:**
- `cn` exported in Phase 1, re-exported unchanged from `src/index.ts` in Phase 2.
- Public API exports (Button + buttonVariants + ButtonProps pattern) consistent across CVA-using primitives (Button, Badge).
- `data-slot` attributes preserved per primitive per the rule in Conventions.
- Story title format `Primitives/<Name>` is consistent (matches the `storySort.order` "Primitives" group).
- `lucide-react` version `^0.545.0` matches what `requerimento-contratos-pf` ships with, so `Check`/`CircleIcon` imports will resolve correctly.

**Risk callouts:**
- Task 7 (radio-group): only source with `dark:` classes — failing to strip them won't crash, but produces dead CSS in the bundle. Audit pass required.
- Task 1 (button): the biggest adaptation. The original button.tsx is 178 lines; the Phase 2 output should be ~55. If the implementer accidentally keeps the `confirm` import chain, `tsc --noEmit` will fail because `@/components/ui/alert-dialog` doesn't exist in this repo — that's an intentional canary.
- Total commit count after Phase 2: 13 new commits (vs. Phase 1's 20). Smaller because the deps task absorbs the previously-separate config commits.
