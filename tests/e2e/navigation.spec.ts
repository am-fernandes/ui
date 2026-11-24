import { type Page, expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

// Storybook's dev server can still be compiling on the first hit: wait for the
// shell itself instead of acting on a half-loaded iframe.
async function gotoShell(page: Page, id: string) {
  await page.goto(story(id))
  await expect(page.locator('[data-slot="app-shell"]')).toBeAttached({ timeout: 15_000 })
}

test.describe("Tabs", () => {
  test("clicking trigger switches content", async ({ page }) => {
    await page.goto(story("navigation-tabs--default"))
    const tabs = page.getByRole("tab")
    const count = await tabs.count()
    expect(count).toBeGreaterThan(1)
    await tabs.nth(1).click()
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true")
  })

  test("keyboard arrow navigates between tabs", async ({ page }) => {
    await page.goto(story("navigation-tabs--default"))
    const first = page.getByRole("tab").first()
    await first.focus()
    await page.keyboard.press("ArrowRight")
    const second = page.getByRole("tab").nth(1)
    await expect(second).toBeFocused()
  })
})

test.describe("Accordion", () => {
  test("clicking trigger expands content", async ({ page }) => {
    await page.goto(story("navigation-accordion--single"))
    const trigger = page.getByRole("button").first()
    await trigger.click()
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
  })

  test("clicking expanded trigger collapses it (collapsible=true)", async ({ page }) => {
    await page.goto(story("navigation-accordion--single"))
    const trigger = page.getByRole("button").first()
    await trigger.click()
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
    await trigger.click()
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
  })
})

test.describe("Breadcrumb", () => {
  test("last item is marked as current page", async ({ page }) => {
    await page.goto(story("navigation-breadcrumb--default"))
    const current = page.locator('[aria-current="page"]')
    await expect(current).toHaveCount(1)
  })
})

test.describe("AppShell", () => {
  test("menu header and navbar are both 64px and end on the same line", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--default")
    const header = await page.locator('[data-slot="app-shell-brand"]').boundingBox()
    const navbar = await page.locator('[data-slot="app-shell-navbar"]').boundingBox()
    expect(header?.height).toBe(64)
    expect(navbar?.height).toBe(64)
    expect(header && header.y + header.height).toBe(navbar && navbar.y + navbar.height)
  })

  test("navbar content lines up with the page content (same 24px inset)", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--default")
    const navbarContent = await page.locator('[data-slot="app-shell-navbar-content"]').boundingBox()
    const title = await page.getByRole("heading", { name: "Leads" }).boundingBox()
    expect(navbarContent && title).toBeTruthy()
    expect(navbarContent?.x).toBe(title?.x)
  })

  test("only the content scrolls: navbar and menu stay put", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--default")
    const main = page.locator("main#conteudo")
    const navbar = page.locator('[data-slot="app-shell-navbar"]')
    const before = await navbar.boundingBox()
    const scrolled = await main.evaluate((el) => {
      el.scrollTop = 400
      return el.scrollTop
    })
    expect(scrolled).toBeGreaterThan(0)
    expect(await navbar.boundingBox()).toEqual(before)
    const frame = page.getByTestId("app-shell-frame")
    expect(await frame.evaluate((el) => el.scrollTop)).toBe(0)
  })

  test("collapse button at the bottom switches between 256px and the 64px rail", async ({
    page,
  }) => {
    await gotoShell(page, "navigation-appshell--default")
    const aside = page.locator('aside[data-slot="app-shell-sidebar"]')
    expect((await aside.boundingBox())?.width).toBe(256)
    await page.getByRole("button", { name: "Recolher menu" }).click()
    await expect(aside).toHaveAttribute("data-state", "collapsed")
    await expect.poll(async () => (await aside.boundingBox())?.width).toBe(64)
    // Persisted for the next visit (the story decorator resets it on load).
    expect(await page.evaluate(() => window.localStorage.getItem("amf-ui:sidebar:collapsed"))).toBe(
      "true",
    )
    await page.getByRole("button", { name: "Expandir menu" }).click()
    await expect.poll(async () => (await aside.boundingBox())?.width).toBe(256)
  })

  test("collapsing and expanding from the keyboard keeps focus on the toggle", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--default")
    const aside = page.locator('aside[data-slot="app-shell-sidebar"]')
    await page.getByRole("button", { name: "Recolher menu" }).focus()
    await page.keyboard.press("Enter")
    await expect(aside).toHaveAttribute("data-state", "collapsed")
    await expect(page.getByRole("button", { name: "Expandir menu" })).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(aside).toHaveAttribute("data-state", "expanded")
    await expect(page.getByRole("button", { name: "Recolher menu" })).toBeFocused()
  })

  test("the rail shows a dot for a badge and the initial of an item without icon", async ({
    page,
  }) => {
    await gotoShell(page, "navigation-appshell--rail-without-icons")
    const aside = page.locator('aside[data-slot="app-shell-sidebar"]')
    const leads = aside.getByRole("link", { name: /^Leads\s*,\s*3$/ })
    await expect(leads).toBeVisible()
    const dot = leads.locator('[data-slot="app-shell-item-dot"]')
    await expect(dot).toBeVisible()
    expect((await dot.boundingBox())?.width).toBe(8)
    // The count and the label are not drawn in the 64px rail.
    await expect(leads.getByText("3", { exact: true })).not.toBeInViewport()
    const initial = aside
      .getByRole("link", { name: "Obras" })
      .locator('[data-slot="app-shell-item-initial"]')
    await expect(initial).toHaveText("O")
    await expect(initial).toBeVisible()
    const link = (await aside.getByRole("link", { name: "Obras" }).boundingBox())!
    const box = (await initial.boundingBox())!
    // Centred in the item, where the icons are.
    expect(Math.abs(box.x + box.width / 2 - (link.x + link.width / 2))).toBeLessThanOrEqual(1)
  })

  test("collapsed rail shows the item label as a tooltip", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--collapsed")
    await page.getByRole("link", { name: "Calculadora" }).hover()
    await expect(page.getByRole("tooltip", { name: "Calculadora" })).toBeVisible()
  })

  test("a group in the collapsed rail opens its pages in a menu next to the rail", async ({
    page,
  }) => {
    await gotoShell(page, "navigation-appshell--collapsed")
    const aside = page.locator('aside[data-slot="app-shell-sidebar"]')
    const group = aside.getByRole("button", { name: "Propostas" })
    await group.click()
    const menu = page.getByRole("menu")
    await expect(menu).toBeVisible()
    await expect(menu.getByRole("menuitem", { name: "Pendentes" })).toBeVisible()
    await expect(menu.getByRole("menuitem", { name: "Vendidas" })).toBeVisible()
    const rail = (await aside.boundingBox())!
    const box = (await menu.boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(rail.x + rail.width)

    await page.keyboard.press("Escape")
    await expect(menu).toBeHidden()
    await expect(group).toBeFocused()

    // From the keyboard: Enter opens it with the first page focused.
    await page.keyboard.press("Enter")
    await expect(page.getByRole("menuitem", { name: "Pendentes" })).toBeFocused()
    await page.keyboard.press("ArrowDown")
    await expect(page.getByRole("menuitem", { name: "Aprovadas" })).toBeFocused()
  })

  test("skip link appears on focus and moves focus to the content", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--default")
    await page.keyboard.press("Tab")
    const skip = page.getByRole("link", { name: "Pular para o conteúdo" })
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
    await page.keyboard.press("Enter")
    await expect(page.locator("main#conteudo")).toBeFocused()
  })

  test("under a title bar, h-full keeps the footer inside the window", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--under-title-bar")
    const frame = await page.getByTestId("app-shell-frame").boundingBox()
    const shell = await page.locator('[data-slot="app-shell"]').boundingBox()
    expect(frame && shell).toBeTruthy()
    const frameBottom = (frame?.y ?? 0) + (frame?.height ?? 0)
    const shellBottom = (shell?.y ?? 0) + (shell?.height ?? 0)
    expect(shellBottom).toBeLessThanOrEqual(frameBottom)
    await expect(page.getByRole("button", { name: "Recolher menu" })).toBeInViewport()
  })
})
