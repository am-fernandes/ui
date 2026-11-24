import { type Page, expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

// Storybook's dev server can still be compiling on the first hit: wait for the
// shell itself instead of acting on a half-loaded iframe.
async function gotoShell(page: Page, id: string) {
  await page.goto(story(id))
  await expect(page.locator('[data-slot="app-shell"]')).toBeAttached({ timeout: 15_000 })
}

test.describe("Tabs", () => {
  test("a tab list wider than its container scrolls and keeps the active tab in sight", async ({
    page,
  }) => {
    await page.goto(story("navigation-tabs--many-tabs"))
    const list = page.getByRole("tablist")
    const wrapper = (await page.locator('[data-slot="tabs"]').boundingBox())!
    const box = (await list.boundingBox())!
    expect(box.width).toBeLessThanOrEqual(wrapper.width + 0.5)
    expect(await list.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true)
    await page.getByRole("tab", { name: "Resumo" }).click()
    await page.keyboard.press("End")
    const last = page.getByRole("tab", { name: "Tarefas" })
    await expect(last).toHaveAttribute("aria-selected", "true")
    // Fully inside the visible part of the list.
    await expect
      .poll(async () => {
        const tab = (await last.boundingBox())!
        const frame = (await list.boundingBox())!
        return tab.x >= frame.x - 0.5 && tab.x + tab.width <= frame.x + frame.width + 0.5
      })
      .toBe(true)
    // The page itself did not scroll.
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test("without a default the first tab and its panel are shown", async ({ page }) => {
    await page.goto(story("navigation-tabs--without-default"))
    await expect(page.getByRole("tab", { name: "Visão geral" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
    await expect(page.getByRole("tabpanel")).toContainText("Resumo da conta")
  })

  // `navigation-tabs--default` has a play function that clicks a tab itself;
  // these use a story without one so the two never race.
  test("clicking trigger switches content", async ({ page }) => {
    await page.goto(story("navigation-tabs--without-default"))
    const tabs = page.getByRole("tab")
    await expect(tabs.first()).toBeVisible({ timeout: 15_000 })
    expect(await tabs.count()).toBeGreaterThan(1)
    await tabs.nth(1).click()
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true")
    await expect(tabs.first()).toHaveAttribute("aria-selected", "false")
  })

  test("keyboard arrow navigates between tabs", async ({ page }) => {
    await page.goto(story("navigation-tabs--without-default"))
    const first = page.getByRole("tab").first()
    await expect(first).toBeVisible({ timeout: 15_000 })
    await first.focus()
    await page.keyboard.press("ArrowRight")
    const second = page.getByRole("tab").nth(1)
    await expect(second).toBeFocused()
    await expect(second).toHaveAttribute("aria-selected", "true")
  })
})

test.describe("Accordion", () => {
  test("a focus ring inside an open panel is not clipped", async ({ page }) => {
    await page.goto(story("navigation-accordion--default-value-open"))
    const panel = page.locator('[data-slot="accordion-content"][data-state="open"]').first()
    await expect(panel).toBeVisible({ timeout: 15_000 })
    // A full-width control at the top of the panel: the worst case for a
    // ring drawn 3px outside the box.
    await panel.evaluate((el) => {
      const button = document.createElement("button")
      button.type = "button"
      button.textContent = "Salvar seção"
      button.style.display = "block"
      button.style.width = "100%"
      el.firstElementChild?.prepend(button)
    })
    const button = panel.getByRole("button", { name: "Salvar seção" })
    await button.focus()
    const room = await page.evaluate(
      ([p, b]) => {
        const clip = (p as HTMLElement).getBoundingClientRect()
        const box = (b as HTMLElement).getBoundingClientRect()
        return {
          left: box.left - clip.left,
          right: clip.right - box.right,
          top: box.top - clip.top,
        }
      },
      [await panel.elementHandle(), await button.elementHandle()],
    )
    // The library ring: 2px wide, 3px away from the edge.
    for (const side of [room.left, room.right, room.top]) expect(side).toBeGreaterThanOrEqual(5)
  })

  test("a disabled item looks and behaves disabled", async ({ page }) => {
    await page.goto(story("navigation-accordion--disabled"))
    const trigger = page.getByRole("button", { name: "Bloqueado" })
    await expect(trigger).toBeDisabled()
    const item = page.locator('[data-slot="accordion-item"]').filter({ has: trigger })
    expect(await item.evaluate((el) => getComputedStyle(el).opacity)).toBe("0.5")
    // Only once: the trigger inside is not dimmed again.
    expect(await trigger.evaluate((el) => getComputedStyle(el).opacity)).toBe("1")
    expect(await trigger.evaluate((el) => getComputedStyle(el).cursor)).toBe("default")
    await trigger.hover({ force: true })
    expect(await trigger.evaluate((el) => getComputedStyle(el).textDecorationLine)).toBe("none")
    // An enabled one still reacts.
    const enabled = page.getByRole("button", { name: "Habilitado", exact: true })
    expect(await enabled.evaluate((el) => getComputedStyle(el).cursor)).toBe("pointer")
  })

  test("clicking trigger expands content", async ({ page }) => {
    await page.goto(story("navigation-accordion--multiple"))
    const closed = page.locator('[data-slot="accordion-trigger"][aria-expanded="false"]').first()
    await expect(closed).toBeVisible({ timeout: 15_000 })
    const name = (await closed.textContent()) ?? ""
    await closed.click()
    await expect(page.getByRole("button", { name, exact: true })).toHaveAttribute(
      "aria-expanded",
      "true",
    )
  })

  test("clicking expanded trigger collapses it (collapsible=true)", async ({ page }) => {
    await page.goto(story("navigation-accordion--default-value-open"))
    const trigger = page.locator('[data-slot="accordion-trigger"][aria-expanded="true"]')
    await expect(trigger).toHaveCount(1, { timeout: 15_000 })
    const name = (await trigger.textContent()) ?? ""
    await trigger.click()
    await expect(page.getByRole("button", { name, exact: true })).toHaveAttribute(
      "aria-expanded",
      "false",
    )
  })
})

test.describe("Breadcrumb", () => {
  async function gotoTrail(page: Page, id: string) {
    await page.goto(story(id))
    await expect(page.locator('[data-slot="breadcrumb"]')).toBeAttached({ timeout: 15_000 })
  }

  test("last item is marked as current page", async ({ page }) => {
    await gotoTrail(page, "navigation-breadcrumb--default")
    const current = page.locator('[aria-current="page"]')
    await expect(current).toHaveCount(1)
  })

  test("is a valid list for assistive technology, named in Portuguese", async ({ page }) => {
    await gotoTrail(page, "navigation-breadcrumb--long-trail")
    await expect(page.getByRole("navigation", { name: "Trilha de navegação" })).toBeVisible()
    // axe's `list` rule used to fail on the separator <li role="presentation">.
    await expectNoA11yViolations(page, '[data-slot="breadcrumb"]')
  })

  test("a collapsed trail opens the hidden steps from the keyboard", async ({ page }) => {
    await gotoTrail(page, "navigation-breadcrumb--collapsed-trail")
    const trail = page.getByRole("navigation", { name: "Trilha de navegação" })
    await expect(trail.getByRole("link")).toHaveText(["Home", "Frontend"])

    const more = trail.getByRole("button", { name: "Mostrar itens ocultos da trilha" })
    const box = await more.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(24)
    expect(box?.height).toBeGreaterThanOrEqual(24)

    await more.focus()
    await page.keyboard.press("Enter")
    const menu = page.getByRole("menu")
    await expect(menu.getByRole("menuitem")).toHaveText([
      "Empresa",
      "Departamentos",
      "Engenharia",
      "Equipes",
    ])
    await expect(menu.getByRole("menuitem", { name: "Equipes" })).toHaveAttribute(
      "href",
      "/empresa/departamentos/engenharia/equipes",
    )
    await page.keyboard.press("Escape")
    await expect(menu).toHaveCount(0)
    await expect(more).toBeFocused()
  })

  test("renderLink receives the click, so a router can navigate without a reload", async ({
    page,
  }) => {
    await gotoTrail(page, "navigation-breadcrumb--with-router-link")
    const link = page.getByRole("link", { name: "Contratos" })
    await expect(link).toHaveAttribute("data-router-link", "")
    await link.click()
    await expect(page).toHaveURL(/#\/contratos$/)
  })
})

test.describe("CommandPalette", () => {
  async function openPalette(page: Page, id: string) {
    await page.goto(story(id))
    await page.getByRole("button", { name: "Abrir paleta" }).click()
    const palette = page.getByRole("dialog", { name: "Comandos" })
    await expect(palette).toBeVisible()
    return palette
  }

  for (const id of [
    "navigation-commandpalette--with-icons",
    "navigation-commandpalette--default",
  ]) {
    test(`the search field starts at the top of the palette: ${id}`, async ({ page }) => {
      const palette = await openPalette(page, id)
      // The dialog animates in: measure once it has settled.
      await expect
        .poll(async () => {
          const dialog = (await palette.boundingBox())!
          const field = (await palette.locator('[data-slot="command-input-wrap"]').boundingBox())!
          return Math.round(field.y - dialog.y)
        })
        .toBeLessThanOrEqual(1)
      // Still named and described for screen readers.
      await expect(palette.getByRole("combobox", { name: "Comandos" })).toBeFocused()
    })
  }

  test("keyboard: search without accents, arrows, Enter runs the item and closes", async ({
    page,
  }) => {
    const palette = await openPalette(page, "navigation-commandpalette--default")
    await page.keyboard.type("configuracoes")
    await expect(palette.getByRole("option")).toHaveCount(1)
    await expect(palette.getByRole("option", { name: "Configurações" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
    await page.keyboard.press("Backspace")
    await page.keyboard.press("Control+a")
    await page.keyboard.press("Backspace")
    await page.keyboard.press("ArrowDown")
    await expect(palette.getByRole("option", { name: "Clientes" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
    await page.keyboard.press("Enter")
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Abrir paleta" })).toBeFocused()
  })
})

test.describe("AppShell", () => {
  test("prints the whole page, not the first screen, and leaves the menu out", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--default")
    const main = page.locator('[data-slot="app-shell-main"]')
    // A page taller than the window, like a long list.
    await main.evaluate((el) => {
      const filler = document.createElement("div")
      filler.style.height = "3000px"
      filler.textContent = "fim da lista"
      el.appendChild(filler)
    })
    await page.emulateMedia({ media: "print" })
    await expect(page.locator('[data-slot="app-shell-sidebar"]')).toBeHidden()
    const sizes = await main.evaluate((el) => ({
      overflow: getComputedStyle(el).overflowY,
      height: el.getBoundingClientRect().height,
      scroll: el.scrollHeight,
    }))
    expect(sizes.overflow).toBe("visible")
    // Nothing is cut: the box is as tall as its content.
    expect(sizes.height).toBeGreaterThanOrEqual(sizes.scroll - 1)
    await page.emulateMedia({ media: "screen" })
  })

  test("the brand button reacts with the state layer, not by fading", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--brand-as-back-button")
    const brand = page.locator(
      '[data-slot="app-shell-sidebar"] button[data-slot="app-shell-brand-mark"]',
    )
    await brand.hover()
    const look = await brand.evaluate((el) => ({
      opacity: getComputedStyle(el).opacity,
      layer: getComputedStyle(el).backgroundImage,
    }))
    expect(look.opacity).toBe("1")
    expect(look.layer).toContain("gradient")
  })

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

  test("sections title their lists and a disabled item tells why", async ({ page }) => {
    await gotoShell(page, "navigation-appshell--with-sections")
    const aside = page.locator('aside[data-slot="app-shell-sidebar"]')
    await expect(aside.getByRole("list", { name: "Vendas" })).toBeVisible()
    const financeiro = aside.getByRole("link", { name: "Financeiro" })
    await financeiro.hover()
    await expect(
      page.getByRole("tooltip", { name: "Disponível para o perfil Gestor" }),
    ).toBeVisible()
    await expectNoA11yViolations(page, 'aside[data-slot="app-shell-sidebar"]')
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
