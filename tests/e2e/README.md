# Playwright E2E Tests

These specs run against the **running Storybook** (Chromium) and exercise flows
that need a real browser:

- Focus traps, focus-visible rendering
- Pointer interactions (real hover/click timing, real drag-and-drop)
- Native HTML behavior (file pickers, native dialogs)
- Layout-dependent assertions (responsive collapsibility)

For unit-level component logic, see the colocated `*.test.tsx` files run by vitest.
For smoke-test of every story (no interaction), see `bun run test:storybook`.

## Run

```bash
bun run test:e2e             # CI mode — auto-starts Storybook dev
bun run test:e2e:headed      # see the browser
bun run test:e2e:ui          # Playwright UI mode
```

## Adding a spec

```ts
import { expect, test } from "@playwright/test"

test("description", async ({ page }) => {
  await page.goto("/iframe.html?id=primitives-button--default&viewMode=story")
  await page.getByRole("button", { name: "Button" }).click()
})
```
