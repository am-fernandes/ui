import { expect, test } from "@playwright/test"

// Snapshots can take a while to settle (font load, network idle); bump the
// per-test timeout so transient slowness on Storybook's static server doesn't
// cause spurious "context closed" or wait-for-function timeouts.
test.setTimeout(60_000)

/**
 * Visual regression tests.
 *
 * Captures screenshots of representative, deterministic stories and compares
 * them against a committed baseline. Run with:
 *
 *   bun run test:visual               # compare against baseline
 *   bun run test:visual:update        # refresh the baseline
 *
 * Snapshots live in `tests/e2e/visual.spec.ts-snapshots/`.
 *
 * Excluded by design:
 *   - Stories that portalize (Dialog, Sheet, Popover, Tooltip, AlertDialog,
 *     DropdownMenu — its geometry is asserted in overlays.spec.ts):
 *     portaled content lives outside the iframe body, producing flaky frames.
 *   - Calendar / date pickers: snapshot churns every day.
 *   - Sonner (Toaster): renders only on user action.
 *   - AppShell's mobile menu (portaled drawer) — its geometry is asserted in
 *     mobile.spec.ts instead.
 */

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

// Force system fonts everywhere during visual tests so we don't race
// against Geist (loaded from @fontsource at runtime). Geist's font-loaded
// event fires at slightly different points across runs, which produced
// sub-pixel rendering jitter and flaky failures on identical UI. The
// stack matches the fallback half of --font-sans / --font-mono in
// tokens.css — what the lib renders when Geist hasn't loaded.
const KILL_ANIMATIONS = `
*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
  caret-color: transparent !important;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}
[class*="font-mono"], code, kbd, pre, samp, [class*="tabular-nums"] {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace !important;
}
`

async function snapshot(page: import("@playwright/test").Page, id: string, file: string) {
  await page.goto(story(id), { waitUntil: "domcontentloaded" })
  // Wait for Storybook to flip from "preparing" to "main" (story mounted)
  // OR for storybook-root to have a rendered child. Either is a strong signal
  // the story has been hydrated.
  // Both conditions, and not "preparing": while Storybook recompiles (HMR)
  // the root can still hold a stale child under the loading spinner, and a
  // small component against a blank frame stays under the 2% diff budget.
  await page.waitForFunction(
    () =>
      document.body.classList.contains("sb-show-main") &&
      !document.body.classList.contains("sb-show-preparing-story") &&
      !!document.getElementById("storybook-root")?.firstChild,
    null,
    { timeout: 30_000 },
  )
  // Let any post-mount network work settle (images, etc.). Note that the
  // `test.beforeEach` route blocks Google Fonts entirely, so we don't need to
  // wait for the web font swap — every run renders with the local system
  // fallback and is deterministic across machines.
  await page.waitForLoadState("networkidle").catch(() => {})
  await page.addStyleTag({ content: KILL_ANIMATIONS })
  // Wait for any remaining (local) fonts to be ready.
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready
  })
  // Two animation frames lets the browser paint before we screenshot.
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  )
  // Snapshot the viewport (iframe.html has no storybook chrome). This avoids
  // visibility auto-wait failures when the rendered story is smaller than the
  // body / storybook-root element.
  await expect(page).toHaveScreenshot(file, { fullPage: false })
}

// Block remote font CDNs (Google Fonts, etc.) before each test. This keeps the
// snapshot deterministic across machines/networks: every render uses the local
// fallback font instead of racing against Google Fonts' CDN.
test.beforeEach(async ({ page }) => {
  await page.route(/(fonts\.googleapis\.com|fonts\.gstatic\.com)/, (route) => route.abort())
})

test.describe("Visual: Primitives — Button", () => {
  test("default", async ({ page }) => {
    await snapshot(page, "primitives-button--default", "button-default.png")
  })
  test("destructive", async ({ page }) => {
    await snapshot(page, "primitives-button--destructive", "button-destructive.png")
  })
  test("outline", async ({ page }) => {
    await snapshot(page, "primitives-button--outline", "button-outline.png")
  })
  test("secondary", async ({ page }) => {
    await snapshot(page, "primitives-button--secondary", "button-secondary.png")
  })
  test("ghost", async ({ page }) => {
    await snapshot(page, "primitives-button--ghost", "button-ghost.png")
  })
  test("link", async ({ page }) => {
    await snapshot(page, "primitives-button--link", "button-link.png")
  })
  test("all-variants", async ({ page }) => {
    await snapshot(page, "primitives-button--all-variants", "button-all-variants.png")
  })
  test("loading", async ({ page }) => {
    await snapshot(page, "primitives-button--loading", "button-loading.png")
  })
  test("disabled", async ({ page }) => {
    await snapshot(page, "primitives-button--disabled", "button-disabled.png")
  })
})

test.describe("Visual: Primitives — Badge", () => {
  test("default", async ({ page }) => {
    await snapshot(page, "primitives-badge--default", "badge-default.png")
  })
  test("destructive", async ({ page }) => {
    await snapshot(page, "primitives-badge--destructive", "badge-destructive.png")
  })
  test("secondary", async ({ page }) => {
    await snapshot(page, "primitives-badge--secondary", "badge-secondary.png")
  })
  test("outline", async ({ page }) => {
    await snapshot(page, "primitives-badge--outline", "badge-outline.png")
  })
  test("with-icon", async ({ page }) => {
    await snapshot(page, "primitives-badge--with-icon", "badge-with-icon.png")
  })
  test("all-variants", async ({ page }) => {
    await snapshot(page, "primitives-badge--all-variants", "badge-all-variants.png")
  })
})

test.describe("Visual: Primitives — Checkbox", () => {
  test("default", async ({ page }) => {
    await snapshot(page, "primitives-checkbox--default", "checkbox-default.png")
  })
  test("checked", async ({ page }) => {
    await snapshot(page, "primitives-checkbox--checked", "checkbox-checked.png")
  })
  test("disabled", async ({ page }) => {
    await snapshot(page, "primitives-checkbox--disabled", "checkbox-disabled.png")
  })
  test("with-error", async ({ page }) => {
    await snapshot(page, "primitives-checkbox--with-error", "checkbox-with-error.png")
  })
})

test.describe("Visual: Primitives — Switch", () => {
  test("default (off)", async ({ page }) => {
    await snapshot(page, "primitives-switch--default", "switch-default.png")
  })
  test("disabled-checked (on)", async ({ page }) => {
    await snapshot(page, "primitives-switch--disabled-checked", "switch-disabled-checked.png")
  })
  test("with-error", async ({ page }) => {
    await snapshot(page, "primitives-switch--with-error", "switch-with-error.png")
  })
})

test.describe("Visual: Primitives — Input", () => {
  test("default", async ({ page }) => {
    await snapshot(page, "primitives-input--default", "input-default.png")
  })
  test("with-error", async ({ page }) => {
    await snapshot(page, "primitives-input--with-error", "input-with-error.png")
  })
  test("with-leading-icon", async ({ page }) => {
    await snapshot(page, "primitives-input--with-leading-icon", "input-with-leading-icon.png")
  })
  test("password-toggle", async ({ page }) => {
    await snapshot(page, "primitives-input--password-toggle", "input-password-toggle.png")
  })
})

test.describe("Visual: Primitives — Textarea", () => {
  test("default", async ({ page }) => {
    await snapshot(page, "primitives-textarea--default", "textarea-default.png")
  })
  test("with-error", async ({ page }) => {
    await snapshot(page, "primitives-textarea--with-error", "textarea-with-error.png")
  })
  test("auto-resize", async ({ page }) => {
    await snapshot(page, "primitives-textarea--auto-resize", "textarea-auto-resize.png")
  })
})

test.describe("Visual: Primitives — Avatar", () => {
  // NOTE: `primitives-avatar--default` uses a remote image (github.com/shadcn.png)
  // which is unreliable for visual regression — load timing varies and CDN may
  // serve different-quality variants. We snapshot the fallback states instead.
  test("fallback", async ({ page }) => {
    await snapshot(page, "primitives-avatar--fallback", "avatar-fallback.png")
  })
  test("fallback-icon", async ({ page }) => {
    await snapshot(page, "primitives-avatar--fallback-icon", "avatar-fallback-icon.png")
  })
})

test.describe("Visual: Primitives — Separator", () => {
  test("horizontal (default)", async ({ page }) => {
    await snapshot(page, "primitives-separator--default", "separator-default.png")
  })
  test("vertical", async ({ page }) => {
    await snapshot(page, "primitives-separator--vertical", "separator-vertical.png")
  })
})

test.describe("Visual: Primitives — Skeleton", () => {
  test("card", async ({ page }) => {
    await snapshot(page, "primitives-skeleton--card", "skeleton-card.png")
  })
})

test.describe("Visual: Primitives — Typography", () => {
  test("heading", async ({ page }) => {
    await snapshot(page, "primitives-typography--heading", "typography-heading.png")
  })
  test("title", async ({ page }) => {
    await snapshot(page, "primitives-typography--title", "typography-title.png")
  })
  test("lead", async ({ page }) => {
    await snapshot(page, "primitives-typography--lead", "typography-lead.png")
  })
  test("body", async ({ page }) => {
    await snapshot(page, "primitives-typography--body", "typography-body.png")
  })
})

test.describe("Visual: Overlays — Alert", () => {
  test("info", async ({ page }) => {
    await snapshot(page, "overlays-alert--info", "alert-info.png")
  })
  test("success", async ({ page }) => {
    await snapshot(page, "overlays-alert--success", "alert-success.png")
  })
  test("warning", async ({ page }) => {
    await snapshot(page, "overlays-alert--warning", "alert-warning.png")
  })
  test("destructive", async ({ page }) => {
    await snapshot(page, "overlays-alert--destructive", "alert-destructive.png")
  })
  test("with-action", async ({ page }) => {
    await snapshot(page, "overlays-alert--with-action", "alert-with-action.png")
  })
})

test.describe("Visual: Overlays — Progress", () => {
  test("zero", async ({ page }) => {
    await snapshot(page, "overlays-progress--zero", "progress-zero.png")
  })
  test("default (half)", async ({ page }) => {
    await snapshot(page, "overlays-progress--default", "progress-default.png")
  })
  test("full", async ({ page }) => {
    await snapshot(page, "overlays-progress--full", "progress-full.png")
  })
  test("playground", async ({ page }) => {
    await snapshot(page, "overlays-progress--playground", "progress-playground.png")
  })
})

test.describe("Visual: Navigation — Tabs", () => {
  test("default", async ({ page }) => {
    await snapshot(page, "navigation-tabs--default", "tabs-default.png")
  })
})

test.describe("Visual: Navigation — Accordion", () => {
  test("single (default)", async ({ page }) => {
    await snapshot(page, "navigation-accordion--default", "accordion-default.png")
  })
  test("multiple", async ({ page }) => {
    await snapshot(page, "navigation-accordion--multiple", "accordion-multiple.png")
  })
})

test.describe("Visual: Navigation — Breadcrumb", () => {
  test("default", async ({ page }) => {
    await snapshot(page, "navigation-breadcrumb--default", "breadcrumb-default.png")
  })
  test("long-trail", async ({ page }) => {
    await snapshot(page, "navigation-breadcrumb--long-trail", "breadcrumb-long-trail.png")
  })
})

test.describe("Visual: Data — Card", () => {
  test("with-action", async ({ page }) => {
    await snapshot(page, "data-card--with-action", "card-with-action.png")
  })
  test("with-footer", async ({ page }) => {
    await snapshot(page, "data-card--with-footer", "card-with-footer.png")
  })
})

test.describe("Visual: Data — ScrollArea", () => {
  test("default (vertical)", async ({ page }) => {
    await snapshot(page, "data-scrollarea--default", "scrollarea-default.png")
  })
})

test.describe("Visual: Domain — CurrencyInput", () => {
  test("default", async ({ page }) => {
    await snapshot(page, "domain-currencyinput--default", "currencyinput-default.png")
  })
})

test.describe("Visual: Domain — PercentageInput", () => {
  test("default", async ({ page }) => {
    await snapshot(page, "domain-percentageinput--default", "percentageinput-default.png")
  })
})

test.describe("Visual: Domain — InputOTP", () => {
  test("default", async ({ page }) => {
    await snapshot(page, "domain-inputotp--default", "inputotp-default.png")
  })
})

test.describe("Visual: Navigation — AppShell", () => {
  test("default (expanded, navbar, footer)", async ({ page }) => {
    await snapshot(page, "navigation-appshell--default", "appshell-default.png")
  })
  test("collapsed rail", async ({ page }) => {
    await snapshot(page, "navigation-appshell--collapsed", "appshell-collapsed.png")
  })
  test("only items", async ({ page }) => {
    await snapshot(page, "navigation-appshell--only-items", "appshell-only-items.png")
  })
})

test.describe("Visual: Primitives — IconButton", () => {
  test("variants", async ({ page }) => {
    await snapshot(page, "primitives-iconbutton--variants", "iconbutton-variants.png")
  })
  test("sizes", async ({ page }) => {
    await snapshot(page, "primitives-iconbutton--sizes", "iconbutton-sizes.png")
  })
  test("next to Button", async ({ page }) => {
    await snapshot(page, "primitives-iconbutton--next-to-button", "iconbutton-next-to-button.png")
  })
})

test.describe("Visual: Primitives — SegmentedControl", () => {
  test("default", async ({ page }) => {
    await snapshot(page, "primitives-segmentedcontrol--default", "segmentedcontrol-default.png")
  })
  test("with icons", async ({ page }) => {
    await snapshot(
      page,
      "primitives-segmentedcontrol--with-icons",
      "segmentedcontrol-with-icons.png",
    )
  })
  test("small", async ({ page }) => {
    await snapshot(page, "primitives-segmentedcontrol--small", "segmentedcontrol-small.png")
  })
})

test.describe("Visual: Data — EmptyState", () => {
  test("default", async ({ page }) => {
    await snapshot(page, "data-emptystate--default", "emptystate-default.png")
  })
  test("compact", async ({ page }) => {
    await snapshot(page, "data-emptystate--compact", "emptystate-compact.png")
  })
})

test.describe("Visual: Primitives — Token", () => {
  test("colors", async ({ page }) => {
    await snapshot(page, "primitives-token--colors", "token-colors.png")
  })
  test("sizes", async ({ page }) => {
    await snapshot(page, "primitives-token--sizes", "token-sizes.png")
  })
  test("token-vs-badge", async ({ page }) => {
    await snapshot(page, "primitives-token--token-vs-badge", "token-token-vs-badge.png")
  })
})

test.describe("Visual: Navigation — Pagination", () => {
  test("many-pages", async ({ page }) => {
    await snapshot(page, "navigation-pagination--many-pages", "pagination-many-pages.png")
  })
  test("with-totals", async ({ page }) => {
    await snapshot(page, "navigation-pagination--with-totals", "pagination-with-totals.png")
  })
  test("small", async ({ page }) => {
    await snapshot(page, "navigation-pagination--small", "pagination-small.png")
  })
  test("compact", async ({ page }) => {
    await snapshot(page, "navigation-pagination--compact", "pagination-compact.png")
  })
})

test.describe("Visual: Navigation — Stepper", () => {
  test("default", async ({ page }) => {
    await snapshot(page, "navigation-stepper--default", "stepper-default.png")
  })
  test("with-status", async ({ page }) => {
    await snapshot(page, "navigation-stepper--with-status", "stepper-with-status.png")
  })
  test("completed", async ({ page }) => {
    await snapshot(page, "navigation-stepper--completed", "stepper-completed.png")
  })
  test("vertical", async ({ page }) => {
    await snapshot(page, "navigation-stepper--vertical", "stepper-vertical.png")
  })
  test("narrow-container", async ({ page }) => {
    await snapshot(page, "navigation-stepper--narrow-container", "stepper-narrow-container.png")
  })
})

test.describe("Visual: Data — Schedule", () => {
  test("month", async ({ page }) => {
    await snapshot(page, "data-schedule--month", "schedule-month.png")
  })
  test("week", async ({ page }) => {
    await snapshot(page, "data-schedule--week", "schedule-week.png")
  })
  test("list", async ({ page }) => {
    await snapshot(page, "data-schedule--list", "schedule-list.png")
  })
})
