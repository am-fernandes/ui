/**
 * Responsive-layout E2E specs.
 *
 * Unlike `mobile.spec.ts` and `tablet.spec.ts` (which run inside their own
 * Playwright projects against a fixed device emulation), this spec lives in
 * the desktop `chromium` project and **flips the viewport at runtime** via
 * `page.setViewportSize()`. It exercises the SAME story across mobile / tablet
 * / desktop and asserts that the component **adapts** the layout — not just
 * "renders" at the alternate viewport.
 *
 * Most of the assertions are *geometric invariants* (don't overflow the
 * viewport, keep an aspect ratio, stay clickable) because the library is
 * **intrinsically responsive** — most components rely on `w-full`,
 * `flex-wrap`, and intrinsic content sizing rather than CSS media queries.
 * Sidebar is the exception (it branches on `useIsMobile()`), so it gets
 * proper "mobile vs desktop" assertions.
 */
import { expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
} as const

test.describe("Layout responsivo", () => {
  test("DataTable: container tem overflow-x scroll em todos os viewports", async ({ page }) => {
    for (const [name, vp] of Object.entries(VIEWPORTS)) {
      await page.setViewportSize(vp)
      await page.goto(story("data-datatable--default"))
      // Wait until the table actually renders so we know the page is hydrated
      // before the assertion runs in each viewport iteration.
      const tableEl = page.locator('[data-slot="table"]').first()
      await expect(tableEl, `viewport: ${name}`).toBeVisible({ timeout: 10_000 })
      // The Table primitive wraps the <table> in `relative w-full overflow-auto`.
      // This is what enables horizontal scrolling on narrow viewports — it must
      // exist at *every* viewport, otherwise an unsuspecting wide column would
      // push the page sideways.
      const scrollContainer = page.locator(".overflow-auto", { has: tableEl }).first()
      await expect(scrollContainer, `viewport: ${name}`).toBeVisible()
    }
  })

  test("Sidebar: vira Sheet (role=dialog) em viewport mobile", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.goto(story("navigation-sidebar--with-groups"))
    // `useIsMobile` is SSR-safe — it defaults to `false` and flips to `true`
    // only after the first effect runs. We wait for the swap explicitly via
    // the data-mobile attribute rather than a fixed sleep.
    const mobileSidebar = page.locator('[data-slot="sidebar"][data-mobile="true"]')
    await expect(mobileSidebar).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole("dialog")).toBeVisible()
  })

  test("Sidebar: permanece como aside em viewport desktop", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.goto(story("navigation-sidebar--with-groups"))
    const aside = page.locator('aside[data-slot="sidebar"]')
    await expect(aside).toBeVisible({ timeout: 10_000 })
    // The mobile branch sets data-mobile="true" and renders inside a Dialog.
    // Neither should be present at desktop width.
    await expect(page.locator('[data-mobile="true"]')).toHaveCount(0)
  })

  test("Tabs: trigger list não estoura a largura do viewport (overflow no scroll)", async ({
    page,
  }) => {
    // The Tabs Default story has three short Brazilian-Portuguese labels
    // ("Visão geral" / "Cobrança" / "Equipe") inside a 520px wrapper. The
    // `TabsList` itself is `inline-flex` — its intrinsic width is the sum of
    // its children, NOT the wrapper. So on a 375-wide viewport the tablist
    // should still fit because the labels are short. This is the "intrinsic
    // responsiveness" invariant: short content stays inside the viewport.
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.goto(story("navigation-tabs--default"))
    const tablist = page.getByRole("tablist")
    await expect(tablist).toBeVisible({ timeout: 10_000 })
    const box = await tablist.boundingBox()
    expect(box).not.toBeNull()
    expect(box?.width ?? 0).toBeLessThanOrEqual(VIEWPORTS.mobile.width)
  })

  test("Dialog: respeita o viewport em mobile sem virar minúsculo", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.goto(story("overlays-dialog--default"))
    await page.getByRole("button", { name: "Abrir dialog" }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    const box = await dialog.boundingBox()
    expect(box).not.toBeNull()
    // Dialog `md` size is `max-w-lg` (32rem ≈ 512px); on a 375 viewport the
    // dialog clamps to the viewport but must NOT exceed it horizontally.
    expect(box?.width ?? 0).toBeLessThanOrEqual(VIEWPORTS.mobile.width + 1)
    // And must remain wide enough to be usable on a phone.
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(280)
  })

  test("Image: aspectRatio mantém a proporção 16:9 em todos os viewports", async ({ page }) => {
    for (const [name, vp] of Object.entries(VIEWPORTS)) {
      await page.setViewportSize(vp)
      await page.goto(story("data-image--with-aspect-ratio"))
      // The Image wrapper has `data-slot="image"` and applies `aspect-ratio`
      // CSS when the prop is set. Verifying the bounding box ratio is the
      // most robust way to confirm the wrapper reserved the right space —
      // independent of how large the parent is.
      const imgWrapper = page.locator('[data-slot="image"]').first()
      await expect(imgWrapper, `viewport: ${name}`).toBeVisible({ timeout: 10_000 })
      const box = await imgWrapper.boundingBox()
      expect(box, `viewport: ${name}`).not.toBeNull()
      if (box && box.height > 0) {
        const ratio = box.width / box.height
        // 16/9 ≈ 1.778 — be generous to allow for subpixel rounding.
        expect(ratio, `viewport: ${name}`).toBeGreaterThan(1.6)
        expect(ratio, `viewport: ${name}`).toBeLessThan(2.0)
      }
    }
  })

  test("FieldShell labelPosition='left' não estoura o viewport em mobile", async ({ page }) => {
    // The Input--LabelLeft story uses `labelPosition="left"`, which is
    // intentionally a flex-row layout *without* a media-query fallback —
    // i.e. the design system does NOT auto-stack the label on mobile. The
    // invariant we *can* assert is that the field shell itself stays
    // inside the viewport (via `w-full`), so the user never sees horizontal
    // page scroll just because they put the label on the left on a phone.
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.goto(story("primitives-input--label-left"))
    const fieldShell = page.locator('[data-slot="field-shell"]').first()
    await expect(fieldShell).toBeVisible({ timeout: 10_000 })
    const box = await fieldShell.boundingBox()
    expect(box).not.toBeNull()
    expect(box?.width ?? 0).toBeLessThanOrEqual(VIEWPORTS.mobile.width)
  })
})
