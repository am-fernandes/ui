import { type Locator, type Page, expect, test } from "@playwright/test"
import { expectFocusRing } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

/**
 * Opens a story and waits until it has rendered. Storybook's dev server may
 * still be compiling on the first hit, so the first wait is a long one.
 *
 * Never point a test at a story that has a `play` function: the two race for
 * the same controls (the play function types or clicks while the test does).
 */
async function open(page: Page, id: string) {
  await page.goto(story(id))
  await expect(page.locator("#storybook-root > *").first()).toBeVisible({ timeout: 15_000 })
}

/**
 * The opacity the eye gets: `opacity` multiplies down the tree, so a control
 * at 50% inside a wrapper at 50% is drawn at 25%.
 */
function effectiveOpacity(locator: Locator) {
  return locator.evaluate((el) => {
    let opacity = 1
    for (let node: Element | null = el; node; node = node.parentElement) {
      opacity *= Number(getComputedStyle(node).opacity)
    }
    return opacity
  })
}

/** Turns the dark theme on the way an app does, with no fade in between. */
async function setDarkTheme(page: Page) {
  await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important}" })
  await page.evaluate(() => document.documentElement.classList.add("dark"))
}

/**
 * WCAG contrast ratio between two CSS colours, resolved by the browser (the
 * tokens are oklch, and computed styles come back in that notation).
 */
function contrast(page: Page, first: string, second: string) {
  return page.evaluate(
    ([a, b]) => {
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = 1
      const context = canvas.getContext("2d", { willReadFrequently: true })
      if (!context) throw new Error("no 2d context")
      const luminance = (color: string) => {
        context.fillStyle = "#ffffff"
        context.fillRect(0, 0, 1, 1)
        context.fillStyle = color
        context.fillRect(0, 0, 1, 1)
        const linear = Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3), (v) => {
          const channel = v / 255
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0)
      }
      const [high, low] = [luminance(a as string), luminance(b as string)].sort((x, y) => y - x)
      return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05)
    },
    [first, second],
  )
}

test.describe("Button", () => {
  test("renders and is clickable", async ({ page }) => {
    await open(page, "primitives-button--secondary")
    const button = page.getByRole("button", { name: "Secundário" })
    await expect(button).toBeEnabled()
    await button.click()
  })

  test("loading: every variant is busy, unavailable and still focusable", async ({ page }) => {
    await open(page, "primitives-button--loading-variants")
    for (const name of ["default", "destructive", "outline", "secondary", "ghost"]) {
      const button = page.getByRole("button", { name, exact: true })
      await expect(button).toHaveAttribute("aria-busy", "true")
      await expect(button).toHaveAttribute("aria-disabled", "true")
      // Not natively disabled: it can still take the keyboard focus.
      expect(await button.evaluate((el: HTMLButtonElement) => el.disabled)).toBe(false)
      // The spinner sits in the middle of the box; the label is laid out but unseen.
      const centres = await button.evaluate((el) => {
        const centre = (node: Element | null) => {
          const rect = node?.getBoundingClientRect()
          return rect ? Math.round(rect.left + rect.width / 2) : null
        }
        const content = el.querySelector('[data-slot="button-content"]')
        return {
          button: centre(el),
          spinner: centre(el.querySelector('[data-slot="button-spinner"] svg')),
          labelOpacity: content ? getComputedStyle(content).opacity : null,
        }
      })
      expect(centres.spinner).toBe(centres.button)
      expect(centres.labelOpacity).toBe("0")
    }
  })

  test("loading keeps the focus and the width, and nothing submits twice", async ({ page }) => {
    await open(page, "primitives-button--loading-on-submit")
    const save = page.getByRole("button", { name: "Salvar proposta" })
    const submits = page.getByTestId("submits")
    const width = async () => (await save.boundingBox())?.width
    const background = () => save.evaluate((el) => getComputedStyle(el).backgroundColor)

    const idleWidth = await width()
    const idleBackground = await background()
    await save.focus()
    await page.keyboard.press("Enter")
    await expect(submits).toHaveText("Envios: 1")
    await expect(save).toHaveAttribute("aria-busy", "true")

    // The focus did not fall to the page body, and the label was not pushed.
    await expect(save).toBeFocused()
    expect(await width()).toBe(idleWidth)
    await expect(page.locator('[data-slot="live-announcer"]')).toHaveText("Carregando…")

    // Enter, Space, a click and Enter in a field of the form: all ignored.
    // (A real mouse click: Playwright's own click() waits for an
    // aria-disabled button to become enabled.)
    await page.keyboard.press("Enter")
    await page.keyboard.press("Space")
    const box = await save.boundingBox()
    await page.mouse.click((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + 10)
    await page.getByLabel("Nome da proposta").press("Enter")
    await expect(submits).toHaveText("Envios: 1")

    // No hover reaction while it is unavailable (the mouse is still over it).
    expect(await background()).toBe(idleBackground)
    expect(await save.evaluate((el) => getComputedStyle(el).cursor)).toBe("default")

    await page.getByRole("button", { name: "Concluir envio" }).click()
    await expect(save).not.toHaveAttribute("aria-busy")
    expect(await width()).toBe(idleWidth)
    // Available again: the hover tone of the primary is back.
    await save.hover()
    await expect.poll(background).not.toBe(idleBackground)
    await save.click()
    await expect(submits).toHaveText("Envios: 2")
  })

  test("a long label stays inside a narrow container, truncated or wrapped", async ({ page }) => {
    await open(page, "primitives-button--long-label")
    const container = await page.getByTestId("narrow").boundingBox()
    const limit = (container?.x ?? 0) + (container?.width ?? 0)
    const [truncated, wrapped] = await Promise.all(
      [0, 1].map((index) => page.getByRole("button").nth(index).boundingBox()),
    )
    expect((truncated?.x ?? 0) + (truncated?.width ?? 0)).toBeLessThanOrEqual(limit)
    expect(truncated?.height).toBe(40)
    expect((wrapped?.x ?? 0) + (wrapped?.width ?? 0)).toBeLessThanOrEqual(limit)
    expect(wrapped?.height).toBeGreaterThan(40)
    // The whole text is still the name of the truncated one.
    await expect(
      page.getByRole("button", { name: "Enviar proposta comercial para análise" }),
    ).toHaveCount(2)
  })

  test("asChild + disabled: the link is dimmed, focusable and does not navigate", async ({
    page,
  }) => {
    await open(page, "primitives-button--as-child")
    const link = page.getByRole("link", { name: "Relatório indisponível" })
    await expect(link).toHaveAttribute("aria-disabled", "true")
    const style = await link.evaluate((el) => {
      const computed = getComputedStyle(el)
      return { opacity: computed.opacity, cursor: computed.cursor }
    })
    expect(style).toEqual({ opacity: "0.5", cursor: "default" })

    // A real mouse click, then the keyboard: neither follows the href.
    const box = await link.boundingBox()
    await page.mouse.click((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + 10)
    await link.focus()
    await expect(link).toBeFocused()
    await page.keyboard.press("Enter")
    expect(new URL(page.url()).hash).toBe("")
  })

  test("disabled state blocks clicks", async ({ page }) => {
    await open(page, "primitives-button--all-states")
    const button = page.locator('[data-slot="button"]:disabled').first()
    await expect(button).toBeDisabled()
  })

  test("focus ring renders on Tab focus, not on a mouse click", async ({ page }) => {
    await open(page, "primitives-button--outline")
    const button = page.getByRole("button", { name: "Cancelar" })
    await button.click()
    await expect(button).toBeFocused()
    expect(await button.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("none")
    await page.keyboard.press("Shift+Tab")
    await page.keyboard.press("Tab")
    await expect(button).toBeFocused()
    await expectFocusRing(button)
  })
})

test.describe("IconButton", () => {
  test("stays square in a row too narrow for its content", async ({ page }) => {
    await open(page, "primitives-iconbutton--tight-row")
    for (const name of ["Editar proposta", "Excluir proposta"]) {
      const box = await page.getByRole("button", { name }).boundingBox()
      expect(box?.width, `width of ${name}`).toBe(40)
      expect(box?.height, `height of ${name}`).toBe(40)
    }
  })

  test("disabled: the tooltip still says what it is, Tab reaches it, nothing fires", async ({
    page,
  }) => {
    await open(page, "primitives-iconbutton--row-actions")
    const remove = page.getByRole("button", { name: "Excluir proposta" })
    const last = page.getByTestId("last-action")
    await expect(remove).toHaveAttribute("aria-disabled", "true")
    expect(await remove.evaluate((el) => getComputedStyle(el).opacity)).toBe("0.5")

    // The mouse: the tooltip shows up, the click does nothing.
    const box = await remove.boundingBox()
    const x = (box?.x ?? 0) + (box?.width ?? 0) / 2
    const y = (box?.y ?? 0) + (box?.height ?? 0) / 2
    await page.mouse.move(x, y)
    await expect(page.getByRole("tooltip", { name: "Excluir proposta" })).toBeVisible()
    await page.mouse.click(x, y)
    await expect(last).toHaveText("Última ação: nenhuma")

    // The keyboard: Tab goes from "Editar" to it, with the tooltip; Enter does nothing.
    await page.mouse.move(0, 0)
    await page.getByRole("button", { name: "Editar proposta" }).focus()
    await page.keyboard.press("Tab")
    await expect(remove).toBeFocused()
    await expect(page.getByRole("tooltip", { name: "Excluir proposta" })).toBeVisible()
    await page.keyboard.press("Enter")
    await page.keyboard.press("Space")
    await expect(last).toHaveText("Última ação: nenhuma")

    // The enabled one beside it still works.
    await page.getByRole("button", { name: "Editar proposta" }).click()
    await expect(last).toHaveText("Última ação: editar")
  })
})

test.describe("Toggle", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`the pressed default variant has an edge of 3:1 or more (${theme})`, async ({ page }) => {
      await open(page, "primitives-toggle--all-variants")
      if (theme === "dark") await setDarkTheme(page)
      const colours = (name: string) =>
        page.getByRole("button", { name, exact: true }).evaluate((el) => {
          const style = getComputedStyle(el)
          return { border: style.borderTopColor, fill: style.backgroundColor }
        })
      const off = await colours("default off")
      const on = await colours("default on")
      // The surface the toggle sits on is the fill of the unpressed one.
      const surface = off.fill

      const onEdge = await contrast(page, on.border, surface)
      expect(onEdge, "pressed border against the surface").toBeGreaterThanOrEqual(3)
      expect(
        await contrast(page, on.border, on.fill),
        "pressed border against its own fill",
      ).toBeGreaterThanOrEqual(3)
      // Pressed must never be the fainter of the two states.
      expect(onEdge).toBeGreaterThanOrEqual(await contrast(page, off.border, surface))
    })
  }
})

// Disabled is one look: the whole field at 50%, once, and no pointer cursor.
// The label of a Checkbox, Switch or RadioGroup used to stay at 100%.
test.describe("Disabled look", () => {
  const look = async (locator: Locator) => ({
    opacity: await effectiveOpacity(locator),
    cursor: await locator.evaluate((el) => getComputedStyle(el).cursor),
  })
  const disabled = { opacity: 0.5, cursor: "default" }

  test("Checkbox: box and label are dimmed together", async ({ page }) => {
    await open(page, "primitives-checkbox--disabled")
    expect(await look(page.getByText("Opção indisponível"))).toEqual(disabled)
    expect(await look(page.getByRole("checkbox"))).toEqual(disabled)
  })

  test("Switch: track and label are dimmed together", async ({ page }) => {
    await open(page, "primitives-switch--disabled")
    expect(await look(page.getByText("Indisponível"))).toEqual(disabled)
    expect(await look(page.getByRole("switch"))).toEqual(disabled)
  })

  test("RadioGroup: the whole group, or only the option that is disabled", async ({ page }) => {
    await open(page, "primitives-radiogroup--disabled")
    expect(await effectiveOpacity(page.getByText("Plano", { exact: true }))).toBe(0.5)
    for (const name of ["Free", "Pro", "Team"]) {
      expect(await look(page.getByText(name, { exact: true }))).toEqual(disabled)
      expect(await look(page.getByRole("radio", { name }))).toEqual(disabled)
    }

    await open(page, "primitives-radiogroup--controlled")
    expect(await look(page.getByText("Team", { exact: true }))).toEqual(disabled)
    expect(await look(page.getByRole("radio", { name: "Team" }))).toEqual(disabled)
    expect(await look(page.getByText("Pro", { exact: true }))).toEqual({
      opacity: 1,
      cursor: "pointer",
    })
  })

  test("Input: the label follows the field", async ({ page }) => {
    await open(page, "primitives-input--disabled")
    expect(await look(page.getByText("Nome", { exact: true }))).toEqual(disabled)

    // Enabled: the label invites the click that focuses the field.
    await open(page, "primitives-input--with-description")
    expect(await look(page.getByText("E-mail", { exact: true }))).toEqual({
      opacity: 1,
      cursor: "pointer",
    })
  })
})

test.describe("Label", () => {
  /** Geometry of a control and of the first line of the label beside it. */
  const firstLine = (control: Locator, label: Locator) =>
    Promise.all([
      control.boundingBox(),
      label.evaluate((el) => {
        const style = getComputedStyle(el)
        const range = document.createRange()
        range.selectNodeContents(el)
        const lines = Array.from(range.getClientRects())
        const first = lines[0]
        const lineCount = new Set(lines.map((rect) => Math.round(rect.top))).size
        return {
          fontSize: Number.parseFloat(style.fontSize),
          lineHeight: Number.parseFloat(style.lineHeight),
          lineCount,
          firstLineCentre: first ? first.top + first.height / 2 : 0,
        }
      }),
    ]).then(([box, text]) => ({
      ...text,
      controlCentre: (box?.y ?? 0) + (box?.height ?? 0) / 2,
    }))

  test("a wrapped checkbox label keeps real line spacing, with the box on its first line", async ({
    page,
  }) => {
    await open(page, "primitives-checkbox--long-label")
    const line = await firstLine(page.getByRole("checkbox"), page.locator('[data-slot="label"]'))
    expect(line.lineCount).toBeGreaterThanOrEqual(3)
    // 14px text on 14px lines had the lines touching.
    expect(line.lineHeight / line.fontSize).toBeGreaterThanOrEqual(1.4)
    expect(Math.abs(line.controlCentre - line.firstLineCentre)).toBeLessThanOrEqual(1)
  })

  test("a long switch label wraps inside its container instead of running out of it", async ({
    page,
  }) => {
    await open(page, "primitives-switch--long-label")
    const container = await page.getByTestId("narrow").boundingBox()
    const label = await page.locator('[data-slot="label"]').boundingBox()
    const right = (box: { x: number; width: number } | null) => (box?.x ?? 0) + (box?.width ?? 0)
    expect(right(label)).toBeLessThanOrEqual(right(container))
    const line = await firstLine(page.getByRole("switch"), page.locator('[data-slot="label"]'))
    expect(line.lineCount).toBeGreaterThanOrEqual(3)
    expect(Math.abs(line.controlCentre - line.firstLineCentre)).toBeLessThanOrEqual(1)
  })

  test("a one-line label sits level with its checkbox, radio or switch", async ({ page }) => {
    await open(page, "primitives-checkbox--checked")
    const checkbox = await firstLine(
      page.getByRole("checkbox"),
      page.locator('[data-slot="label"]'),
    )
    expect(Math.abs(checkbox.controlCentre - checkbox.firstLineCentre)).toBeLessThanOrEqual(1)

    await open(page, "primitives-switch--disabled-checked")
    const toggle = await firstLine(page.getByRole("switch"), page.locator('[data-slot="label"]'))
    expect(Math.abs(toggle.controlCentre - toggle.firstLineCentre)).toBeLessThanOrEqual(1)

    await open(page, "primitives-radiogroup--default-value")
    const radio = await firstLine(
      page.getByRole("radio", { name: "Pro" }),
      page.getByText("Pro", { exact: true }),
    )
    expect(Math.abs(radio.controlCentre - radio.firstLineCentre)).toBeLessThanOrEqual(1)
  })
})

test.describe("Checkbox", () => {
  test("clicking the label toggles state (implicit Radix binding)", async ({ page }) => {
    await open(page, "primitives-checkbox--with-description")
    const label = page.getByText("Receber newsletter")
    const box = page.getByRole("checkbox", { name: "Receber newsletter" })
    await expect(box).toHaveAttribute("aria-checked", "false")
    await label.click()
    await expect(box).toHaveAttribute("aria-checked", "true")
  })

  test("keyboard Space toggles", async ({ page }) => {
    await open(page, "primitives-checkbox--with-description")
    const box = page.getByRole("checkbox", { name: "Receber newsletter" })
    await box.focus()
    await page.keyboard.press("Space")
    await expect(box).toHaveAttribute("aria-checked", "true")
  })
})

test.describe("Input", () => {
  test("typing updates the value", async ({ page }) => {
    await open(page, "primitives-input--with-description")
    const input = page.getByLabel("E-mail")
    await input.fill("joao@exemplo.com")
    await expect(input).toHaveValue("joao@exemplo.com")
  })

  test("error renders role=alert", async ({ page }) => {
    await open(page, "primitives-input--with-error")
    await expect(page.getByRole("alert")).toBeVisible()
  })

  // A read-only field used to look exactly like an editable one: a computed
  // or locked value seemed typeable.
  test("read-only looks different from editable: filled, and no hover ring", async ({ page }) => {
    const field = (slot: Locator) =>
      slot.evaluate((el) => {
        const style = getComputedStyle(el)
        return { background: style.backgroundColor, shadow: style.boxShadow }
      })
    // No fade between the resting and the hovered state.
    const settle = (p: Page) =>
      p.addStyleTag({ content: "*,*::before,*::after{transition:none!important}" })

    await open(page, "primitives-input--with-description")
    await settle(page)
    const editable = page.locator('[data-slot="input-wrapper"]')
    const editableRest = await field(editable)
    await editable.hover()
    const editableHover = await field(editable)
    expect(editableHover.shadow).not.toBe(editableRest.shadow)

    await open(page, "primitives-input--read-only")
    await settle(page)
    const readOnly = page.locator('[data-slot="input-wrapper"]')
    const readOnlyRest = await field(readOnly)
    expect(readOnlyRest.background).not.toBe(editableRest.background)
    await readOnly.hover()
    const readOnlyHover = await field(readOnly)
    // A transparent ring, or none: nothing is drawn.
    expect(
      readOnlyHover.shadow === "none" ||
        /rgba\(0, 0, 0, 0\)|transparent/.test(readOnlyHover.shadow),
    ).toBe(true)

    // Still reachable and readable, only not editable.
    const input = page.getByRole("textbox", { name: "ID" })
    await input.focus()
    await expect(input).toBeFocused()
    await page.keyboard.type("x")
    await expect(input).toHaveValue("user-123456")
  })

  test("a click on the icon or the padding of the box focuses the field", async ({ page }) => {
    await open(page, "primitives-input--with-leading-icon")
    const input = page.getByRole("textbox", { name: "Buscar" })
    await page.locator('[data-slot="input-leading"] svg').click()
    await expect(input).toBeFocused()

    await input.blur()
    const box = await page.locator('[data-slot="input-wrapper"]').boundingBox()
    // 2px inside the right edge: the padding, not the text.
    await page.mouse.click((box?.x ?? 0) + (box?.width ?? 0) - 2, (box?.y ?? 0) + 20)
    await expect(input).toBeFocused()
  })

  test("password toggle changes input type", async ({ page }) => {
    await open(page, "primitives-input--password-toggle")
    // `exact`: the toggle button is named "Mostrar senha", which also contains "Senha".
    const input = page.getByLabel("Senha", { exact: true })
    await expect(input).toHaveAttribute("type", "password")
    await page.getByRole("button", { name: "Mostrar senha" }).click()
    await expect(input).toHaveAttribute("type", "text")
  })
})

test.describe("RadioGroup", () => {
  test("the group is named after its label in the accessibility tree", async ({ page }) => {
    await open(page, "primitives-radiogroup--horizontal")
    const group = page.getByRole("radiogroup", { name: "Tamanho" })
    await expect(group).toBeVisible()
    await expect(group.getByRole("radio")).toHaveCount(4)
  })

  test("required blocks the submit until an option is chosen", async ({ page }) => {
    await open(page, "primitives-radiogroup--in-form")
    await expect(page.getByRole("radiogroup", { name: "Plano" })).toHaveAttribute(
      "aria-required",
      "true",
    )
    await page.getByRole("button", { name: "Enviar" }).click()
    expect(
      await page.locator("form").evaluate((form: HTMLFormElement) => form.checkValidity()),
    ).toBe(false)
    await expect(page.getByText(/Enviado/)).toHaveCount(0)

    await page.getByRole("radio", { name: "Pro" }).click()
    await page.getByRole("button", { name: "Enviar" }).click()
    await expect(page.getByText("Enviado: pro")).toBeVisible()
  })
})

test.describe("Textarea", () => {
  test("autoResize and the counter follow a value written by code and a narrower box", async ({
    page,
  }) => {
    // Resizing inside a ResizeObserver callback makes the browser report a loop.
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(String(error)))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })

    await open(page, "primitives-textarea--value-set-by-code")
    const textarea = page.getByLabel("Observações")
    // How much of the text is cut off by `overflow: hidden`.
    const hidden = () => textarea.evaluate((el) => el.scrollHeight - el.clientHeight)
    const height = async () => (await textarea.boundingBox())?.height ?? 0

    const empty = await height()
    await expect(page.getByText("0/2000")).toBeVisible()

    // Assigned through the ref: no input event, no re-render.
    await page.getByRole("button", { name: "Carregar observação" }).click()
    await expect(page.getByText("578/2000")).toBeVisible()
    await expect.poll(hidden).toBe(0)
    const loaded = await height()
    expect(loaded).toBeGreaterThan(empty + 100)

    // Half the width: every line wraps, so the box has to grow again.
    await page.getByRole("button", { name: "Estreitar" }).click()
    await expect.poll(height).toBeGreaterThan(loaded + 100)
    await expect.poll(hidden).toBe(0)

    await page.getByRole("button", { name: "Alargar" }).click()
    await expect.poll(height).toBe(loaded)
    await expect.poll(hidden).toBe(0)

    expect(errors).toEqual([])
  })
})

test.describe("SegmentedControl", () => {
  test("controlled: one onValueChange per arrow, key held or tapped", async ({ page }) => {
    await open(page, "primitives-segmentedcontrol--controlled")
    const changes = page.getByTestId("changes")
    await page.keyboard.press("Tab")
    await expect(page.getByRole("radio", { name: "Dia" })).toBeFocused()

    // Held, the way a person presses a key: down, a moment, up.
    await page.keyboard.down("ArrowRight")
    await page.waitForTimeout(60)
    await page.keyboard.up("ArrowRight")
    await expect(page.getByRole("radio", { name: "Semana" })).toHaveAttribute(
      "aria-checked",
      "true",
    )
    await expect(changes).toHaveText("onValueChange: semana")

    // Tapped: released in the same tick.
    await page.keyboard.press("ArrowRight")
    await expect(page.getByRole("radio", { name: "Mês" })).toHaveAttribute("aria-checked", "true")
    await expect(changes).toHaveText("onValueChange: semana, mes")
  })

  test("disabled is dimmed once: 50%, never 50% of 50%", async ({ page }) => {
    const radio = (name: string) => page.getByRole("radio", { name })

    await open(page, "primitives-segmentedcontrol--disabled")
    for (const name of ["Dia", "Semana", "Mês"]) {
      expect(await effectiveOpacity(radio(name))).toBe(0.5)
    }

    await open(page, "primitives-segmentedcontrol--disabled-option")
    expect(await effectiveOpacity(radio("Mês"))).toBe(0.5)
    expect(await effectiveOpacity(radio("Dia"))).toBe(1)
  })

  test("arrows move and select in a real browser; one Tab stop", async ({ page }) => {
    await open(page, "primitives-segmentedcontrol--default")
    await page.keyboard.press("Tab")
    const semana = page.getByRole("radio", { name: "Semana" })
    await expect(semana).toBeFocused()
    // `press` releases the key in the same tick — the hardest case.
    await page.keyboard.press("ArrowRight")
    const mes = page.getByRole("radio", { name: "Mês" })
    await expect(mes).toBeFocused()
    await expect(mes).toHaveAttribute("aria-checked", "true")
    await expect(semana).toHaveAttribute("aria-checked", "false")
    // Wraps around.
    await page.keyboard.press("ArrowRight")
    await expect(page.getByRole("radio", { name: "Dia" })).toHaveAttribute("aria-checked", "true")
  })

  test("the vertical arrows move and select as well", async ({ page }) => {
    await open(page, "primitives-segmentedcontrol--default")
    await page.keyboard.press("Tab")
    await page.keyboard.press("ArrowDown")
    const mes = page.getByRole("radio", { name: "Mês" })
    await expect(mes).toBeFocused()
    await expect(mes).toHaveAttribute("aria-checked", "true")
    await page.keyboard.press("ArrowUp")
    const semana = page.getByRole("radio", { name: "Semana" })
    await expect(semana).toBeFocused()
    await expect(semana).toHaveAttribute("aria-checked", "true")
  })

  test("selected segment stands out and the focus ring is visible", async ({ page }) => {
    await open(page, "primitives-segmentedcontrol--default")
    const selected = page.getByRole("radio", { name: "Semana" })
    const other = page.getByRole("radio", { name: "Dia" })
    const bg = (l: typeof selected) => l.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(await bg(selected)).not.toBe(await bg(other))
    await page.keyboard.press("Tab")
    await expectFocusRing(selected)
  })

  test("fill stretches segments to equal widths", async ({ page }) => {
    await open(page, "primitives-segmentedcontrol--fill")
    const widths = await page
      .getByRole("radio")
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)))
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1)
  })

  test("submits the chosen value with the form", async ({ page }) => {
    await open(page, "primitives-segmentedcontrol--in-form")
    await page.getByRole("radio", { name: "Pessoa jurídica" }).click()
    await page.getByRole("button", { name: "Enviar" }).click()
    await expect(page.getByText("Enviado: pj")).toBeVisible()
  })

  test("icon-only segments show their label as a tooltip", async ({ page }) => {
    await open(page, "primitives-segmentedcontrol--icon-only")
    await page.getByRole("radio", { name: "Lista" }).hover()
    await expect(page.getByRole("tooltip", { name: "Lista" })).toBeVisible()
  })
})

/** The colour of the pixel at (`x`, `y`), as fractions of the element's box, in a screenshot. */
async function pixelAt(page: Page, locator: Locator, x: number, y: number) {
  const png = await locator.screenshot({ animations: "disabled" })
  return page.evaluate(
    async ({ data, fx, fy }) => {
      const blob = await (await fetch(`data:image/png;base64,${data}`)).blob()
      const bitmap = await createImageBitmap(blob)
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      const context = canvas.getContext("2d")
      if (!context) throw new Error("no 2d context")
      context.drawImage(bitmap, 0, 0)
      const [r = 0, g = 0, b = 0] = context.getImageData(
        Math.floor(bitmap.width * fx),
        Math.floor(bitmap.height * fy),
        1,
        1,
      ).data
      return { r, g, b }
    },
    { data: png.toString("base64"), fx: x, fy: y },
  )
}

test.describe("Avatar", () => {
  // The story's photo is 100×200 in three bands: green on top, blue in the
  // middle half, red at the bottom. Squashed into the circle (`fill`), the
  // green shows at the top; cropped (`cover`), only the blue middle shows.
  test("a portrait photo is cropped to the circle, not squashed", async ({ page }) => {
    await open(page, "primitives-avatar--portrait-photo")
    const photo = page.locator('[data-slot="avatar-image"]')
    await expect(photo).toBeVisible()
    const avatar = page.locator('[data-slot="avatar"]')
    for (const y of [0.15, 0.5, 0.85]) {
      const { r, g, b } = await pixelAt(page, avatar, 0.5, y)
      expect({ y, blue: b > 150 && r < 100 && g < 150 }).toEqual({ y, blue: true })
    }
  })
})
