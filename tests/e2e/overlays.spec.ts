import { type Page, expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

test.describe("Dialog", () => {
  test("opens via trigger, traps focus, closes on Escape", async ({ page }) => {
    // Not the Default story: its `play` function opens and closes the dialog
    // by itself and would race with the steps below.
    await gotoStory(page, "overlays-dialog--with-footer", "Editar com footer")
    const trigger = page.getByRole("button", { name: "Editar com footer" })
    await trigger.click()
    const dialog = page.getByRole("dialog", { name: "Editar perfil" })
    await expect(dialog).toBeVisible()

    // Focus moves to the first field of the dialog.
    await expect(dialog.getByLabel("Nome")).toBeFocused()

    // Tab cycles inside the dialog (focus trap): it never reaches the page.
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab")
      expect(
        await dialog.evaluate((el) => el.contains(document.activeElement)),
        `focus stays in the dialog after ${i + 1} Tab(s)`,
      ).toBe(true)
    }

    // Escape closes and focus goes back to the trigger.
    await page.keyboard.press("Escape")
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test("dismissible=false blocks Escape and overlay click", async ({ page }) => {
    await page.goto(story("overlays-dialog--non-dismissible"))
    await page.getByRole("button", { name: /abrir/i }).click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await page.keyboard.press("Escape")
    // Dialog must still be open.
    await expect(dialog).toBeVisible()
  })
})

test.describe("Tooltip", () => {
  // The Sides story, not Default: Default has a `play` function that focuses
  // the trigger, so its tooltip is already open (and held open) by focus.
  test("appears on hover and disappears on mouse leave", async ({ page }) => {
    await gotoStory(page, "overlays-tooltip--sides", "top")
    await page.getByRole("button", { name: "top", exact: true }).hover()
    await expect(page.getByRole("tooltip", { name: "side=top" })).toBeVisible()
    // Several moves, like a real mouse: Radix closes on the first move past
    // the trigger and the "grace area" that leads to the tooltip.
    await page.mouse.move(0, 0, { steps: 10 })
    await expect(page.getByRole("tooltip")).toHaveCount(0)
  })

  test("appears on keyboard focus and Escape dismisses it", async ({ page }) => {
    await gotoStory(page, "overlays-tooltip--sides", "top")
    await page.keyboard.press("Tab")
    await expect(page.getByRole("button", { name: "top", exact: true })).toBeFocused()
    await expect(page.getByRole("tooltip", { name: "side=top" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("tooltip")).toHaveCount(0)
  })
})

test.describe("Popover", () => {
  test("opens via trigger and closes on Escape, returning focus", async ({ page }) => {
    // Not the Default story: its `play` function clicks the trigger itself.
    await gotoStory(page, "overlays-popover--align-start", "align=start")
    const trigger = page.getByRole("button", { name: "align=start" })
    await trigger.click()
    const popover = page.getByRole("dialog", { name: "Popover alinhado ao início" })
    await expect(popover).toBeVisible()
    await expect(popover).toContainText("Alinhado ao início do trigger.")
    await page.keyboard.press("Escape")
    await expect(popover).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
})

// Storybook's dev server may still be compiling on the first hit.
async function gotoStory(page: Page, id: string, ready: string) {
  await page.goto(story(id))
  await expect(page.getByRole("button", { name: ready })).toBeVisible({ timeout: 15_000 })
}

test.describe("DropdownMenu", () => {
  test("opens below the trigger, aligned to its start, and returns focus on Escape", async ({
    page,
  }) => {
    await gotoStory(page, "overlays-dropdownmenu--default", "Ações")
    const trigger = page.getByRole("button", { name: "Ações" })
    // Measure before opening: a modal menu hides the rest of the page from
    // the accessibility tree, trigger included.
    const t = await trigger.boundingBox()
    await trigger.click()
    const menu = page.getByRole("menu")
    await expect(menu).toBeVisible()
    // The panel zooms 95% → 100% on open: measure once it has settled.
    await expect
      .poll(async () => Math.abs(((await menu.boundingBox())?.x ?? 0) - (t?.x ?? 0)))
      .toBeLessThanOrEqual(1)
    const m = await menu.boundingBox()
    expect(m && t && m.y).toBeGreaterThanOrEqual((t?.y ?? 0) + (t?.height ?? 0))
    // At least as wide as the trigger.
    expect(m?.width ?? 0).toBeGreaterThanOrEqual(t?.width ?? 0)
    await page.keyboard.press("Escape")
    await expect(menu).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test("keyboard: arrows skip disabled items, typeahead jumps, Enter selects", async ({ page }) => {
    await gotoStory(page, "overlays-dropdownmenu--default", "Ações")
    await page.getByRole("button", { name: "Ações" }).focus()
    await page.keyboard.press("ArrowDown")
    const menu = page.getByRole("menu")
    await expect(menu.getByRole("menuitem", { name: /Editar/ })).toBeFocused()
    await page.keyboard.press("End")
    await expect(menu.getByRole("menuitem", { name: "Excluir" })).toBeFocused()
    // "Arquivar" is disabled: ArrowUp from "Excluir" lands on "Compartilhar".
    await page.keyboard.press("ArrowUp")
    await expect(menu.getByRole("menuitem", { name: "Compartilhar" })).toBeFocused()
    await page.keyboard.type("d")
    await expect(menu.getByRole("menuitem", { name: /Duplicar/ })).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(menu).toHaveCount(0)
  })

  test("submenu opens on hover and on ArrowRight", async ({ page }) => {
    await gotoStory(page, "overlays-dropdownmenu--groups-and-submenu", "Ações")
    await page.getByRole("button", { name: "Ações" }).click()
    const subTrigger = page.getByRole("menuitem", { name: "Mover para" })
    await subTrigger.hover()
    await expect(page.getByRole("menuitem", { name: "Aprovadas" })).toBeVisible()
    // The submenu opens to the right of its row.
    const row = await subTrigger.boundingBox()
    const sub = await page.locator('[data-slot="dropdown-menu-sub-content"]').boundingBox()
    expect(sub?.x ?? 0).toBeGreaterThanOrEqual((row?.x ?? 0) + (row?.width ?? 0) - 1)

    await page.keyboard.press("Escape")
    await page.getByRole("button", { name: "Ações" }).focus()
    await page.keyboard.press("Enter")
    await page.getByRole("menuitem", { name: "Mover para" }).focus()
    await page.keyboard.press("ArrowRight")
    await expect(page.getByRole("menuitem", { name: "Pendentes" })).toBeFocused()
  })

  test("checkbox items with keepOpen toggle without closing", async ({ page }) => {
    await gotoStory(page, "overlays-dropdownmenu--checkbox-items", "Colunas")
    await page.getByRole("button", { name: "Colunas" }).click()
    const telefone = page.getByRole("menuitemcheckbox", { name: "Telefone" })
    await telefone.click()
    await expect(telefone).toHaveAttribute("aria-checked", "true")
    await page.getByRole("menuitemcheckbox", { name: "Nome" }).click()
    await expect(page.getByRole("menu")).toBeVisible()
  })

  test("radio choice updates the trigger and closes", async ({ page }) => {
    await gotoStory(page, "overlays-dropdownmenu--radio-group", "Ordenar: Mais recentes")
    await page.getByRole("button", { name: "Ordenar: Mais recentes" }).click()
    await page.getByRole("menuitemradio", { name: "Maior valor" }).click()
    await expect(page.getByRole("menu")).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Ordenar: Maior valor" })).toBeVisible()
  })

  test("inside a Dialog, item clicks and Escape close only the menu", async ({ page }) => {
    await gotoStory(page, "overlays-dropdownmenu--inside-dialog", "Abrir proposta")
    await page.getByRole("button", { name: "Abrir proposta" }).click()
    const dialog = page.getByRole("dialog", { name: "Proposta #1042" })
    const trigger = dialog.getByRole("button", { name: "Ações da proposta" })
    await expect(dialog).toBeVisible()

    // Mouse: choosing an item closes the menu, not the dialog, and no tooltip
    // pops up on the trigger that gets focus back.
    await trigger.click()
    await page.getByRole("menuitem", { name: /Duplicar/ }).click()
    await expect(page.getByRole("menu")).toHaveCount(0)
    await expect(dialog).toBeVisible()
    await expect(trigger).toBeFocused()
    await expect(page.getByRole("tooltip")).toHaveCount(0)

    // Escape closes the menu only.
    await trigger.click()
    await expect(page.getByRole("menu")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("menu")).toHaveCount(0)
    await expect(dialog).toBeVisible()
    await expect(trigger).toBeFocused()

    // Now in keyboard mode, the trigger shows its tooltip. Escape dismisses
    // the topmost layer first (WCAG 1.4.13), then the dialog.
    await expect(page.getByRole("tooltip", { name: "Ações da proposta" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("tooltip")).toHaveCount(0)
    await expect(dialog).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(dialog).toHaveCount(0)
  })

  test("open menu has no WCAG 2.1 AA violations", async ({ page }) => {
    await gotoStory(page, "overlays-dropdownmenu--groups-and-submenu", "Ações")
    await page.getByRole("button", { name: "Ações" }).click()
    await page.getByRole("menuitem", { name: "Mover para" }).hover()
    await expect(page.getByRole("menuitem", { name: "Aprovadas" })).toBeVisible()
    await expectNoA11yViolations(page, '[data-slot="dropdown-menu-content"]')
    await expectNoA11yViolations(page, '[data-slot="dropdown-menu-sub-content"]')
  })
})

test.describe("IconButton", () => {
  test("shows its label as a tooltip on hover", async ({ page }) => {
    await gotoStory(page, "primitives-iconbutton--variants", "Excluir")
    await page.getByRole("button", { name: "Excluir" }).hover()
    await expect(page.getByRole("tooltip", { name: "Excluir" })).toBeVisible()
  })

  test("tooltip shows on keyboard focus but not on focus placed by code after a click", async ({
    page,
  }) => {
    // The dialog auto-focuses the IconButton after a mouse click on "Abrir proposta".
    await gotoStory(page, "overlays-dropdownmenu--inside-dialog", "Abrir proposta")
    await page.getByRole("button", { name: "Abrir proposta" }).click()
    const dialog = page.getByRole("dialog", { name: "Proposta #1042" })
    await expect(dialog.getByRole("button", { name: "Ações da proposta" })).toBeFocused()
    await expect(page.getByRole("tooltip")).toHaveCount(0)
    // Escape is not swallowed by a tooltip.
    await page.keyboard.press("Escape")
    await expect(dialog).toHaveCount(0)

    // Keyboard users still get the tooltip.
    await gotoStory(page, "primitives-iconbutton--variants", "Novo")
    await page.keyboard.press("Tab")
    await expect(page.getByRole("button", { name: "Novo" })).toBeFocused()
    await expect(page.getByRole("tooltip", { name: "Novo" })).toBeVisible()
  })

  test("sizes are 32, 40 and 44px squares; md matches Button height", async ({ page }) => {
    await gotoStory(page, "primitives-iconbutton--sizes", "Notificações (md)")
    for (const [name, px] of [
      ["Notificações (sm)", 32],
      ["Notificações (md)", 40],
      ["Notificações (lg)", 44],
    ] as const) {
      const box = await page.getByRole("button", { name }).boundingBox()
      expect(box?.width, name).toBe(px)
      expect(box?.height, name).toBe(px)
    }
    await gotoStory(page, "primitives-iconbutton--next-to-button", "Salvar proposta")
    const button = await page.getByRole("button", { name: "Salvar proposta" }).boundingBox()
    const icon = await page.getByRole("button", { name: "Duplicar proposta" }).boundingBox()
    expect(icon?.height).toBe(button?.height)
  })

  test("opens a DropdownMenu as its trigger", async ({ page }) => {
    await gotoStory(page, "overlays-dropdownmenu--row-actions", "Ações da proposta")
    const trigger = page.getByRole("button", { name: "Ações da proposta" })
    const t = await trigger.boundingBox()
    await trigger.click()
    const menu = page.getByRole("menu", { name: "Ações da proposta" })
    await expect(menu).toBeVisible()
    // align="end": the menu's right edge lines up with the trigger's (poll:
    // the open animation scales the panel for a few frames).
    const triggerRight = (t?.x ?? 0) + (t?.width ?? 0)
    await expect
      .poll(async () => {
        const m = await menu.boundingBox()
        return Math.abs((m?.x ?? 0) + (m?.width ?? 0) - triggerRight)
      })
      .toBeLessThanOrEqual(1)
  })
})
