import { type Locator, type Page, expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

// Storybook's dev server may still be compiling on the first hit.
async function gotoStory(page: Page, id: string, ready: string) {
  await page.goto(story(id))
  await expect(page.getByRole("button", { name: ready })).toBeVisible({ timeout: 15_000 })
}

type Box = { x: number; y: number; width: number; height: number }

/**
 * Waits for the open animation to end (a dialog zooms 95% → 100%, a sheet
 * slides in) and returns the settled box. Fonts first: an overlay often brings
 * a weight the page had not loaded yet, and the swap moves every box.
 */
async function settledBox(locator: Locator): Promise<Box> {
  await locator.page().evaluate(() => document.fonts.ready.then(() => undefined))
  let previous = ""
  await expect
    .poll(async () => {
      const key = JSON.stringify(await locator.boundingBox())
      const stable = key === previous
      previous = key
      return stable
    })
    .toBe(true)
  return (await locator.boundingBox())!
}

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

  // A long form on a notebook, on a short window and on a phone: the dialog
  // used to grow past the screen, with the title above it and the footer
  // below it, and nothing scrolled.
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 1280, height: 400 },
    { width: 360, height: 640 },
  ]) {
    test(`tall content at ${viewport.width}×${viewport.height}: the dialog fits the screen and only the body scrolls`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await gotoStory(page, "overlays-dialog--long-form", "Formulário longo")
      await page.getByRole("button", { name: "Formulário longo" }).click()
      const dialog = page.getByRole("dialog", { name: "Nova proposta" })
      await expect(dialog).toBeVisible()

      const box = await settledBox(dialog)
      expect(box.y, "top edge inside the viewport").toBeGreaterThanOrEqual(0)
      expect(box.y + box.height, "bottom edge inside the viewport").toBeLessThanOrEqual(
        viewport.height,
      )
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)

      // Title and footer are on screen, inside the dialog.
      const title = dialog.getByRole("heading", { name: "Nova proposta" })
      const save = dialog.getByRole("button", { name: "Salvar" })
      const titleBox = (await title.boundingBox())!
      const saveBox = (await save.boundingBox())!
      expect(titleBox.y).toBeGreaterThanOrEqual(box.y)
      expect(saveBox.y + saveBox.height).toBeLessThanOrEqual(box.y + box.height)

      // The body is the only thing that scrolls, with the wheel…
      const body = dialog.locator('[data-slot="dialog-body"]')
      const size = await body.evaluate((el) => ({
        scroll: el.scrollHeight,
        client: el.clientHeight,
      }))
      expect(size.scroll).toBeGreaterThan(size.client)
      await body.hover()
      await page.mouse.wheel(0, 300)
      await expect.poll(() => body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
      expect(await title.boundingBox()).toEqual(titleBox)
      expect(await save.boundingBox()).toEqual(saveBox)

      // …and with the keyboard: the last field comes into view above the footer.
      const last = dialog.getByLabel("Observações")
      await last.focus()
      await expect
        .poll(async () => {
          const field = (await last.boundingBox())!
          return field.y >= titleBox.y + titleBox.height && field.y + field.height <= saveBox.y
        })
        .toBe(true)
    })
  }

  test("a control at the edge of the scrolling body keeps its whole focus ring", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 400 })
    await gotoStory(page, "overlays-dialog--long-form", "Formulário longo")
    await page.getByRole("button", { name: "Formulário longo" }).click()
    const dialog = page.getByRole("dialog", { name: "Nova proposta" })
    const body = dialog.locator('[data-slot="dialog-body"]')
    const bodyBox = await settledBox(body)
    // The ring is 2px wide and 3px away from the control. A scroll container
    // clips at its own edge, so the body has to be wider than its content and
    // has to stop short of the edge when it scrolls a control into view.
    const ringFits = async (control: Locator) => {
      const box = (await control.boundingBox())!
      return (
        box.x - 5 >= bodyBox.x &&
        box.x + box.width + 5 <= bodyBox.x + bodyBox.width &&
        box.y - 5 >= bodyBox.y &&
        box.y + box.height + 5 <= bodyBox.y + bodyBox.height
      )
    }
    // Last control, at the left edge and at the end of the scroll.
    const add = dialog.getByRole("button", { name: "Adicionar comprador" })
    await add.focus()
    await expect.poll(() => ringFits(add)).toBe(true)
    // Back up, one field at a time: each one lands with room above it.
    for (let i = 0; i < 4; i++) await page.keyboard.press("Shift+Tab")
    const field = dialog.getByLabel("Parcelas")
    await expect(field).toBeFocused()
    await expect.poll(() => ringFits(field)).toBe(true)
  })
})

test.describe("AlertDialog", () => {
  test("a double click on the confirm button confirms once", async ({ page }) => {
    await gotoStory(page, "overlays-alertdialog--confirm-once", "Aprovar proposta")
    const count = page.getByTestId("confirm-count")
    const open = async () => {
      await page.getByRole("button", { name: "Aprovar proposta" }).click()
      const confirm = page.getByRole("alertdialog").getByRole("button", { name: "Aprovar" })
      await expect(confirm).toBeVisible()
      const box = await settledBox(confirm)
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    }

    // A real double click: two clicks, a few milliseconds apart.
    let point = await open()
    await page.mouse.dblclick(point.x, point.y)
    await expect(page.getByRole("alertdialog")).toHaveCount(0)
    await expect(count).toHaveText("Aprovações enviadas: 1")

    // An impatient user: more clicks while the dialog fades out (175ms).
    point = await open()
    await page.mouse.click(point.x, point.y)
    for (const wait of [60, 60]) {
      await page.waitForTimeout(wait)
      await page.mouse.click(point.x, point.y)
    }
    await expect(page.getByRole("alertdialog")).toHaveCount(0)
    await expect(count).toHaveText("Aprovações enviadas: 2")

    // Enter held down on the focused button repeats the key.
    await page.getByRole("button", { name: "Aprovar proposta" }).click()
    const confirm = page.getByRole("alertdialog").getByRole("button", { name: "Aprovar" })
    await confirm.focus()
    await page.keyboard.down("Enter")
    for (let i = 0; i < 5; i++) await page.keyboard.down("Enter")
    await page.keyboard.up("Enter")
    await expect(page.getByRole("alertdialog")).toHaveCount(0)
    await expect(count).toHaveText("Aprovações enviadas: 3")
    await expect(page.getByTestId("cancel-count")).toHaveText("Cancelamentos: 0")
  })

  test("tall content: fits the screen, the body scrolls and the buttons stay in view", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 500 })
    await gotoStory(page, "overlays-alertdialog--long-body", "Arquivar 40 propostas")
    await page.getByRole("button", { name: "Arquivar 40 propostas" }).click()
    const dialog = page.getByRole("alertdialog", { name: "Arquivar 40 propostas?" })
    await expect(dialog).toBeVisible()
    const box = await settledBox(dialog)
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height).toBeLessThanOrEqual(500)

    const confirm = dialog.getByRole("button", { name: "Arquivar" })
    const confirmBox = (await confirm.boundingBox())!
    expect(confirmBox.y + confirmBox.height).toBeLessThanOrEqual(box.y + box.height)

    const body = dialog.locator('[data-slot="alert-dialog-body"]')
    await body.hover()
    await page.mouse.wheel(0, 300)
    await expect.poll(() => body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
    expect(await confirm.boundingBox()).toEqual(confirmBox)
  })
})

test.describe("Sheet", () => {
  test("spaces title, description and body apart and puts the footer at the bottom", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await gotoStory(page, "overlays-sheet--with-footer", "Abrir com footer")
    await page.getByRole("button", { name: "Abrir com footer" }).click()
    const sheet = page.getByRole("dialog", { name: "Editar projeto" })
    await expect(sheet).toBeVisible()
    const panel = await settledBox(sheet)
    expect(panel.height).toBe(800)

    const title = (await sheet.getByRole("heading", { name: "Editar projeto" }).boundingBox())!
    const description = (await sheet.getByText("Clique em Salvar para confirmar.").boundingBox())!
    const field = (await sheet.getByText("Nome do projeto").boundingBox())!
    // 16px between the parts: they used to touch.
    expect(description.y - (title.y + title.height)).toBe(16)
    expect(field.y - (description.y + description.height)).toBe(16)

    // The footer sits at the bottom of the panel, 24px (the padding) from the edge.
    const save = (await sheet.getByRole("button", { name: "Salvar" }).boundingBox())!
    expect(panel.y + panel.height - (save.y + save.height)).toBe(24)
  })

  test("tall content: only the body scrolls, title and footer stay in view", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 })
    await gotoStory(page, "overlays-sheet--long-form", "Formulário longo")
    await page.getByRole("button", { name: "Formulário longo" }).click()
    const sheet = page.getByRole("dialog", { name: "Novo lead" })
    await expect(sheet).toBeVisible()
    const panel = await settledBox(sheet)
    expect(panel.y).toBe(0)
    expect(panel.height).toBe(600)

    const title = sheet.getByRole("heading", { name: "Novo lead" })
    const save = sheet.getByRole("button", { name: "Salvar" })
    const titleBox = (await title.boundingBox())!
    const saveBox = (await save.boundingBox())!
    expect(titleBox.y).toBeGreaterThanOrEqual(0)
    expect(saveBox.y + saveBox.height).toBeLessThanOrEqual(600)

    const body = sheet.locator('[data-slot="sheet-body"]')
    await body.hover()
    await page.mouse.wheel(0, 300)
    await expect.poll(() => body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
    expect(await title.boundingBox()).toEqual(titleBox)
    expect(await save.boundingBox()).toEqual(saveBox)

    // The last field is reachable with the keyboard, above the footer.
    const last = sheet.getByLabel("Observações")
    await last.focus()
    await expect
      .poll(async () => {
        const box = (await last.boundingBox())!
        return box.y >= titleBox.y + titleBox.height && box.y + box.height <= saveBox.y
      })
      .toBe(true)
  })

  test("a bottom sheet stops growing at the height of the screen and scrolls", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 500 })
    await gotoStory(page, "overlays-sheet--bottom-long", "Abrir (bottom, longo)")
    await page.getByRole("button", { name: "Abrir (bottom, longo)" }).click()
    const sheet = page.getByRole("dialog", { name: "Histórico do lead" })
    await expect(sheet).toBeVisible()
    const panel = await settledBox(sheet)
    // Anchored to the bottom, with the title on screen.
    expect(panel.y + panel.height).toBe(500)
    expect(panel.y).toBeGreaterThanOrEqual(0)
    const title = (await sheet.getByRole("heading", { name: "Histórico do lead" }).boundingBox())!
    expect(title.y).toBeGreaterThanOrEqual(0)

    const body = sheet.locator('[data-slot="sheet-body"]')
    await body.hover()
    await page.mouse.wheel(0, 300)
    await expect.poll(() => body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
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

// A modal locks the page behind it: the wheel and touch scrolling only work
// inside the modal's content. A popover portaled to <body> was outside it, so
// a long list opened from a Dialog or a Sheet did not scroll.
test.describe("Floating layers inside a modal", () => {
  /**
   * Drags a finger up by `distance` px, starting on the centre of `target`.
   * Real touch events, sent through the DevTools protocol: the browser turns
   * them into a scroll, as it does on a phone.
   */
  async function touchScroll(page: Page, target: Locator, distance: number) {
    const box = (await target.boundingBox())!
    const session = await page.context().newCDPSession(page)
    const x = Math.round(box.x + box.width / 2)
    const y = Math.round(box.y + box.height / 2)
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] })
    const steps = 10
    for (let step = 1; step <= steps; step++) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: Math.round(y - (distance * step) / steps) }],
      })
      await page.waitForTimeout(16)
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
  }

  test("a Combobox list inside a Dialog scrolls with the wheel and the Dialog stays open", async ({
    page,
  }) => {
    await gotoStory(page, "forms-combobox--inside-dialog", "Abrir dialog")
    await page.getByRole("button", { name: "Abrir dialog" }).click()
    const dialog = page.getByRole("dialog", { name: "Escolher opção" })
    await expect(dialog).toBeVisible()
    await page.getByRole("combobox").click()
    const list = page.getByRole("listbox")
    await expect(list).toBeVisible()
    expect(
      await list.evaluate((el) => el.scrollHeight > el.clientHeight),
      "the list is longer than its box",
    ).toBe(true)

    await list.hover()
    await page.mouse.wheel(0, 200)
    await expect.poll(() => list.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
    await expect(dialog).toBeVisible()

    // Choosing an option closes the list and nothing else.
    await page.getByRole("option").nth(8).click()
    await expect(list).toHaveCount(0)
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole("combobox")).toBeFocused()
  })

  test("a Popover inside a Dialog opens next to its trigger and its list scrolls", async ({
    page,
  }) => {
    await gotoStory(page, "overlays-popover--inside-dialog", "Abrir dialog")
    await page.getByRole("button", { name: "Abrir dialog" }).click()
    const dialog = page.getByRole("dialog", { name: "Filtrar leads" })
    await settledBox(dialog)
    const trigger = dialog.getByRole("button", { name: "Escolher cidade" })
    const triggerBox = (await trigger.boundingBox())!
    await trigger.click()
    const popover = page.getByRole("dialog", { name: "Cidades" })
    await expect(popover).toBeVisible()

    // Below the trigger (4px away), aligned to its start: the dialog is
    // centred with a transform, which must not throw the position off.
    const box = await settledBox(popover)
    expect(Math.abs(box.x - triggerBox.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(box.y - (triggerBox.y + triggerBox.height + 4))).toBeLessThanOrEqual(1)

    const list = page.getByTestId("city-list")
    await list.hover()
    await page.mouse.wheel(0, 200)
    await expect.poll(() => list.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)

    // A click in the list is a click inside the dialog.
    await page.getByRole("button", { name: "Cidade 12", exact: true }).click()
    await expect(popover).toHaveCount(0)
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole("button", { name: "Cidade 12" })).toBeFocused()
  })

  test("a Popover inside a Sheet opens next to its trigger, even while the panel slides in", async ({
    page,
  }) => {
    await gotoStory(page, "overlays-popover--inside-sheet", "Abrir sheet")
    await page.getByRole("button", { name: "Abrir sheet" }).click()
    const sheet = page.getByRole("dialog", { name: "Filtrar leads" })
    const trigger = sheet.getByRole("button", { name: "Escolher cidade" })
    await expect(sheet).toBeAttached()

    // Opened at once, by code, while the panel is still sliding in (410ms):
    // Playwright's own click would wait for the panel to stop. From then on,
    // frame by frame, how far the popover is from its trigger once the panel
    // has arrived. It used to jump 900px to the left for one frame, when the
    // slide ended and its position stopped being relative to the panel.
    const worst = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          const panel = document.querySelector('[data-slot="sheet-content"]') as HTMLElement
          const button = [...panel.querySelectorAll("button")].find(
            (b) => b.textContent === "Escolher cidade",
          ) as HTMLElement
          button.click()
          let worst = 0
          const start = performance.now()
          const frame = () => {
            const layer = document.querySelector("[data-radix-popper-content-wrapper]")
            const arrived = Math.abs(panel.getBoundingClientRect().right - window.innerWidth) < 0.5
            if (layer && arrived) {
              const offset = layer.getBoundingClientRect().x - button.getBoundingClientRect().x
              worst = Math.max(worst, Math.abs(offset))
            }
            if (performance.now() - start < 1200) requestAnimationFrame(frame)
            else resolve(worst)
          }
          requestAnimationFrame(frame)
        }),
    )
    expect(worst, "largest distance from the trigger, in px").toBeLessThanOrEqual(1)

    const popover = page.getByRole("dialog", { name: "Cidades" })
    await expect(popover).toBeVisible()
    const triggerBox = (await trigger.boundingBox())!
    const box = await settledBox(popover)
    expect(Math.abs(box.x - triggerBox.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(box.y - (triggerBox.y + triggerBox.height + 4))).toBeLessThanOrEqual(1)

    const list = page.getByTestId("city-list")
    await list.hover()
    await page.mouse.wheel(0, 200)
    await expect.poll(() => list.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
    await expect(sheet).toBeVisible()
  })

  test("a tooltip inside a Dialog sits next to its trigger", async ({ page }) => {
    await gotoStory(page, "overlays-dropdownmenu--inside-dialog", "Abrir proposta")
    // Opened from the keyboard, so the auto-focused IconButton shows its tooltip
    // while the dialog is still zooming in.
    await page.getByRole("button", { name: "Abrir proposta" }).focus()
    await page.keyboard.press("Enter")
    const dialog = page.getByRole("dialog", { name: "Proposta #1042" })
    const trigger = dialog.getByRole("button", { name: "Ações da proposta" })
    await expect(trigger).toBeFocused()
    const tooltip = page.locator('[data-slot="tooltip-content"]')
    await expect(tooltip).toBeVisible()
    await settledBox(dialog)
    const triggerBox = (await trigger.boundingBox())!
    const box = await settledBox(tooltip)
    // Above the trigger, 4px away, centred on it.
    expect(Math.abs(box.y + box.height + 4 - triggerBox.y)).toBeLessThanOrEqual(1)
    expect(
      Math.abs(box.x + box.width / 2 - (triggerBox.x + triggerBox.width / 2)),
    ).toBeLessThanOrEqual(1)
  })

  test.describe("touch", () => {
    test.use({ hasTouch: true, viewport: { width: 390, height: 740 } })

    test("a Combobox list inside a Dialog scrolls with the finger", async ({ page }) => {
      await gotoStory(page, "forms-combobox--inside-dialog", "Abrir dialog")
      await page.getByRole("button", { name: "Abrir dialog" }).tap()
      const dialog = page.getByRole("dialog", { name: "Escolher opção" })
      await settledBox(dialog)
      await page.getByRole("combobox").tap()
      const list = page.getByRole("listbox")
      await expect(list).toBeVisible()
      await settledBox(list)
      await touchScroll(page, list, 150)
      await expect.poll(() => list.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
      await expect(dialog).toBeVisible()
    })

    test("a Popover list inside a Sheet scrolls with the finger", async ({ page }) => {
      await gotoStory(page, "overlays-popover--inside-sheet", "Abrir sheet")
      await page.getByRole("button", { name: "Abrir sheet" }).tap()
      const sheet = page.getByRole("dialog", { name: "Filtrar leads" })
      await settledBox(sheet)
      await sheet.getByRole("button", { name: "Escolher cidade" }).tap()
      const list = page.getByTestId("city-list")
      await expect(list).toBeVisible()
      await settledBox(list)
      await touchScroll(page, list, 150)
      await expect.poll(() => list.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
      await expect(sheet).toBeVisible()
    })
  })
})

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
