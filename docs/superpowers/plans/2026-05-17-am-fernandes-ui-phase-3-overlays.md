# `@am-fernandes/ui` — Phase 3: Overlays & Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship 8 overlay/feedback primitives — alert, alert-dialog, dialog, sheet, popover, tooltip, sonner, progress — plus a `ConfirmButton` that composes Button + AlertDialog (re-introducing the confirm flow deferred from Phase 2). Result: `@am-fernandes/ui@0.2.0`.

**Architecture:** Components live under `src/overlays/`. Sources copied from `requerimento-contratos-pf/src/components/ui/{alert,alert-dialog,dialog,sheet,popover,tooltip,sonner,progress}.tsx`. `tw-animate-css` reintroduced to `src/styles/tokens.css` (required by Radix's `data-state=open` enter/exit animations). New `ConfirmButton` (in `src/composed/`) keeps the modular split: Button remains pure, ConfirmButton adds the dialog wrapper.

**Spec:** `docs/superpowers/specs/2026-05-16-am-fernandes-ui-design.md` (Phase 3 — overlays/feedback).

**Source paths:**
- `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/{alert,alert-dialog,dialog,sheet,popover,tooltip,sonner,progress}.tsx`
- For `ConfirmButton`: re-derive from `requerimento-contratos-pf/src/components/ui/button.tsx` (the confirm flow that was stripped in Phase 2).

**New deps:**
```
@radix-ui/react-alert-dialog ^1.1.15
@radix-ui/react-dialog       ^1.1.15
@radix-ui/react-popover      ^1.1.15
@radix-ui/react-tooltip      ^1.2.8
@radix-ui/react-progress     ^1.1.8
sonner                       ^2.0.7
tw-animate-css               ^1.4.0
```

## Conventions (same as Phase 2)

- Flat layout: `src/overlays/<name>.tsx` + `<name>.stories.tsx`. `ConfirmButton` goes in `src/composed/confirm-button.tsx`.
- Strip `dark:` classes (only `alert.tsx` has them in the Phase 3 sources).
- Keep `"use client"`, `data-slot`, `displayName`, `forwardRef`.
- CSF3 stories with `title: "Overlays/<Name>"` (or `"Composed/<Name>"` for ConfirmButton); `tags: ["autodocs"]`, `layout: "centered"` (use `fullscreen` if the story needs viewport space).
- One commit per component.
- Append to `src/index.ts` barrel.
- Update `.storybook/preview.tsx` `storySort.order` to include `"Overlays"` and `"Composed"`.

## Task 0: Setup

- [ ] Add the 7 new deps to `package.json#dependencies` (alphabetical).
- [ ] `bun install`.
- [ ] Edit `src/styles/tokens.css`: add `@import "tw-animate-css";` as the second line (after `@import "tailwindcss";`). Add a comment line above: `/* Required by overlay components for data-state animations. */`.
- [ ] Edit `.storybook/preview.tsx`'s `storySort.order` to append `"Overlays"` and `"Composed"` after `"Primitives"`.
- [ ] Verify all gates green.
- [ ] Commit: `chore(deps): add overlay primitives (alert-dialog/dialog/popover/tooltip/progress) + sonner + tw-animate-css`

## Tasks 1-8: One overlay per task

For each component, the implementer must:
1. Read source from `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/<name>.tsx`.
2. Strip `dark:` classes.
3. For files importing `@/components/ui/button`, replace with relative import `../primitives/button` (alert-dialog does this).
4. Write `src/overlays/<name>.tsx` + `src/overlays/<name>.stories.tsx`.
5. Append to `src/index.ts` barrel (group under a comment `// Overlays`).
6. Run typecheck/lint; commit.

| # | Component | Notes |
|---|---|---|
| 1 | alert | Has `dark:` classes — strip. Exports `Alert`, `AlertTitle`, `AlertDescription`, `alertVariants`. Stories: Default, Variants (default/destructive). |
| 2 | alert-dialog | Imports `buttonVariants` from `@/components/ui/button` → change to `../primitives/button`. Exports the full Radix-style namespace (`AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogPortal`, `AlertDialogOverlay`). Stories: Default (trigger button + dialog with title/description/action/cancel). |
| 3 | dialog | Exports `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`. Uses `X` from lucide-react for close button. Stories: Default (form-like content). |
| 4 | sheet | Same Radix-dialog base as Dialog but with `side` variant via cva (top/right/bottom/left). Exports `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`. Stories: Right (default), Left, Top, Bottom. |
| 5 | popover | Exports `Popover`, `PopoverTrigger`, `PopoverContent`. Stories: Default (trigger button + popover with text). |
| 6 | tooltip | Exports `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`. Stories: Default (wrap in TooltipProvider; trigger button + tooltip). |
| 7 | sonner | Exports `Toaster` (the provider) and re-exports `toast` from sonner. Stories: Default (button that calls `toast.success("...")`); wrap stories with `<Toaster />` decorator. |
| 8 | progress | Exports `Progress`. Stories: Default (`value={60}`), Indeterminate (no value), Zero, Full. |

**Commit messages:** `feat(overlays): add <name>` (e.g., `feat(overlays): add alert-dialog`).

## Task 9: ConfirmButton (composed)

Create `src/composed/confirm-button.tsx`. Modular design:

- Imports `Button` from `../primitives/button` and `AlertDialog*` from `../overlays/alert-dialog`.
- Wraps a Button. Adds props: `confirmTitle: string`, `confirmMessage?: string | ReactNode`, `confirmActionLabel?: string` (default "Confirmar"), `confirmCancelLabel?: string` (default "Cancelar"), `onConfirm: () => void | Promise<void>`, plus all of `ButtonProps`.
- On click, opens the dialog instead of calling onClick.
- The dialog's Action button triggers `onConfirm` and closes.
- Optional `confirmIcon?: ReactNode` for the dialog header icon (default: `<TriangleAlert />` from lucide-react when `variant="destructive"` is passed to the underlying Button, else none).
- Export: `ConfirmButton`, `type ConfirmButtonProps`.

Stories (`confirm-button.stories.tsx`):
- `Default` — `<ConfirmButton confirmTitle="Confirmar ação" onConfirm={action("confirmed")}>Excluir</ConfirmButton>` (with `variant="destructive"`).
- `WithMessage` — same plus `confirmMessage`.

Commit: `feat(composed): add ConfirmButton (Button + AlertDialog composition)`

## Task 10: Verify + bump + tag

- [ ] All gates green; build sizes reasonable.
- [ ] `grep '"Overlays/' storybook-static/index.json` returns 8 entries; `'Composed/'` returns 1.
- [ ] Bump `package.json#version` to `0.2.0`; commit `chore(release): bump version to 0.2.0 for Phase 3`.
- [ ] Tag `v0.2.0` with message `Phase 3: 8 overlays + ConfirmButton`.

## Risk callouts

- **`tw-animate-css` reintroduction** is mandatory for Phase 3 — Radix `data-[state=open]:animate-in` selectors won't resolve without it. The implementer must verify by running build-storybook and confirming no console warnings about missing utilities.
- **`alert-dialog` button import path:** the source has `import { buttonVariants } from "@/components/ui/button"` — the new path is `"../primitives/button"`. Easy regression target.
- **`sonner.tsx` template's incomplete first line** in the source listing (just `import {`) — this is a Read-tool truncation artifact; the file is well-formed. Read it fully.
- **ConfirmButton type variance:** `ButtonProps` from Phase 2 doesn't include any confirm-related fields (we stripped them). ConfirmButton's props extend `Omit<ButtonProps, 'onClick'>` because ConfirmButton intercepts onClick. Verify the resulting type compiles.
