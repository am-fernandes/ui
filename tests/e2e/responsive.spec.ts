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
 * AppShell is the exception (its menu swaps at the 768px breakpoint), so it
 * gets proper "mobile vs desktop" assertions.
 */
import { type Page, expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

// Storybook's dev server can still be compiling on the first hit: wait for the
// shell itself instead of acting on a half-loaded iframe.
async function gotoShell(page: Page, id: string) {
  await page.goto(story(id))
  await expect(page.locator('[data-slot="app-shell"]')).toBeAttached({ timeout: 15_000 })
}

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

  test("AppShell: abaixo de 768px o menu lateral some e vira barra + painel", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    await gotoShell(page, "navigation-appshell--default")
    await expect(page.locator('[data-slot="app-shell-sidebar"]')).toBeHidden()
    const openMenu = page.getByRole("button", { name: "Abrir menu" })
    await expect(openMenu).toBeVisible()
    await openMenu.click()
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible()
  })

  test("AppShell: de 768px para cima o menu lateral fica fixo e a barra mobile some", async ({
    page,
  }) => {
    for (const vp of [VIEWPORTS.tablet, VIEWPORTS.desktop]) {
      await page.setViewportSize(vp)
      await gotoShell(page, "navigation-appshell--default")
      await expect(page.locator('aside[data-slot="app-shell-sidebar"]')).toBeVisible()
      await expect(page.getByRole("button", { name: "Abrir menu" })).toBeHidden()
    }
  })

  test("AppShell: o painel mobile fecha sozinho quando a janela passa de 768px", async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    await gotoShell(page, "navigation-appshell--default")
    await page.getByRole("button", { name: "Abrir menu" }).click()
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible()
    await page.setViewportSize(VIEWPORTS.desktop)
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(page.locator('aside[data-slot="app-shell-sidebar"]')).toBeVisible()
  })

  test("Tabs: a lista de abas não estoura o viewport, rola por dentro", async ({ page }) => {
    // Oito abas (a ficha de um lead) não cabem em 375px: a lista fica do
    // tamanho do contêiner e rola de lado; a página não ganha rolagem lateral.
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.goto(story("navigation-tabs--many-tabs"))
    const tablist = page.getByRole("tablist")
    await expect(tablist).toBeVisible({ timeout: 10_000 })
    const box = (await tablist.boundingBox())!
    expect(box.x + box.width).toBeLessThanOrEqual(VIEWPORTS.mobile.width)
    expect(await tablist.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
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
