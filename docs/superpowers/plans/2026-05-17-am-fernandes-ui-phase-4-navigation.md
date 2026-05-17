# `@am-fernandes/ui` — Phase 4: Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Ship 6 navigation components — tabs, breadcrumb, dropdown-menu, command, accordion, sidebar — as `v0.3.0`. Also adds a `useIsMobile` hook (sidebar dependency).

**Architecture:** Components in `src/navigation/`. Hook in `src/hooks/use-is-mobile.ts`. Sidebar (the largest component, ~700 lines) consolidates many sub-components; it lives as a single module per shadcn convention. Sources copied from `requerimento-contratos-pf` for the first 5; sidebar from `assistencia-tecnica`.

**Sources:**
- `/home/matheus/Projects/requerimento-contratos-pf/src/components/ui/{tabs,breadcrumb,dropdown-menu,command,accordion}.tsx`
- `am-fernandes/assistencia-tecnica`: `packages/web/src/components/ui/sidebar.tsx` (via `gh api`)

**New deps:**
```
@radix-ui/react-tabs        ^1.1.13
@radix-ui/react-dropdown-menu ^2.1.16
@radix-ui/react-accordion   ^1.2.12
cmdk                        ^1.1.1
```

(`@radix-ui/react-slot`, `@radix-ui/react-dialog`, `class-variance-authority`, `lucide-react` already installed.)

## Conventions

- Flat layout `src/navigation/<name>.tsx` + `<name>.stories.tsx`.
- Strip `dark:` classes (sidebar has them; the 5 from requerimento are clean).
- Keep `"use client"`, `data-slot`, `displayName`, `forwardRef`.
- Sidebar's source imports (`@/components/ui/{button,input,separator,sheet,skeleton,tooltip}`, `@/hooks/use-mobile`) → rewrite paths:
  - `@/components/ui/button` → `../primitives/button`
  - `@/components/ui/input` → `../primitives/input`
  - `@/components/ui/separator` → `../primitives/separator`
  - `@/components/ui/skeleton` → `../primitives/skeleton`
  - `@/components/ui/sheet` → `../overlays/sheet`
  - `@/components/ui/tooltip` → `../overlays/tooltip`
  - `@/hooks/use-mobile` → `../hooks/use-is-mobile`
- CSF3 stories with `title: "Navigation/<Name>"`, `tags: ["autodocs"]`, `layout: "centered"` (sidebar story uses `layout: "fullscreen"`).
- Append to `src/index.ts` under a `// Navigation` block.
- Append `"Navigation"` to `.storybook/preview.tsx` `storySort.order` after `"Composed"`.
- One commit per component + 1 setup commit + 1 hook commit.

## Tasks

### Task 0: Setup

- Add new deps to `package.json`.
- `bun install`.
- Add `"Navigation"` to `storySort.order`.
- Verify gates. Commit: `chore(deps): add navigation primitives (tabs/dropdown-menu/accordion) + cmdk`.

### Task 1: `useIsMobile` hook

Create `src/hooks/use-is-mobile.ts`:

A simple React hook that returns `true` when the viewport width is below a breakpoint (default `768`). Use `window.matchMedia` and subscribe via `useEffect`. Returns `boolean`.

```ts
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```

Export from barrel under `// Hooks` block: `export { useIsMobile } from "./hooks/use-is-mobile"`.

Commit: `feat(hooks): add useIsMobile`.

### Tasks 2-6: 5 navigation components from requerimento

For each: read source → strip `dark:` (none expected) → write to `src/navigation/<name>.tsx` → write story → add to barrel → commit `feat(navigation): add <name>`.

| # | Component | Notes |
|---|---|---|
| 2 | tabs | Exports `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`. Story: 3 tabs with simple content panels. |
| 3 | breadcrumb | Exports `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`. Story: 3-level breadcrumb (Home → Contratos → Detalhes). |
| 4 | dropdown-menu | Exports the full Radix namespace (DropdownMenu, Trigger, Content, Item, Label, Separator, Group, Sub, etc.). Story: trigger Button → menu with 3 items, separator, destructive item. |
| 5 | command | Wraps `cmdk`. Exports `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`. Story: Default (inline command palette with 4 actions). |
| 6 | accordion | Exports `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`. Story: 3 items with FAQ-style copy. |

### Task 7: Sidebar (the big one)

Fetch source via `gh api repos/am-fernandes/assistencia-tecnica/contents/packages/web/src/components/ui/sidebar.tsx --jq '.content' | base64 -d > /tmp/sidebar-source.tsx`. Read `/tmp/sidebar-source.tsx`.

Adaptations:
- Strip every `dark:` class. The source has many — audit carefully (`SidebarMenuButton` cva, `SidebarMenuSkeleton`, etc.).
- Rewrite the 7 imports listed in Conventions section.
- The source uses `useIsMobile` (named export). Confirm `useIsMobile` from our new hook has the same return type (`boolean`).
- Keep cookie-based persistence logic intact.

**Output:** `src/navigation/sidebar.tsx` — single file. Yes it's big (~700 lines); the spec acknowledges this. Don't split it.

**Exports:** Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar.

**Story** (`sidebar.stories.tsx`): full-screen layout demo with `<SidebarProvider><Sidebar>…</Sidebar><SidebarInset>main content</SidebarInset></SidebarProvider>`. Sidebar contains a header (logo placeholder), a SidebarMenu with 4 items (each with a lucide icon: `Home`, `Inbox`, `Calendar`, `Settings`), a footer with avatar+name. Use `layout: "fullscreen"`.

Commit: `feat(navigation): add sidebar`

### Task 8: Verify + bump + tag

- Full gate suite green.
- `grep -o '"Navigation/[^"]*"' storybook-static/index.json | sort -u | wc -l` → 6.
- Bump `package.json#version` to `0.3.0`; commit `chore(release): bump version to 0.3.0 for Phase 4`.
- Tag `v0.3.0` with `Phase 4: 6 navigation components + useIsMobile hook`.

## Risks

- **Sidebar size:** the only risky task. If `tsc` fails after the import rewrite, the most likely cause is a missing component reference (e.g., `SheetContent` requires `side="left"` prop — verify the existing Sheet exports support it).
- **cmdk** is a runtime dep; ensure it's added.
- The `useIsMobile` hook returns `boolean` (after my `!!isMobile` coercion); sidebar source may type its consumer as `boolean | undefined`. If a typecheck error appears, change the hook's return to `boolean` (already done above) or adapt the call site.
