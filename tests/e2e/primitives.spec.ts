import { type Page, expect, test } from "@playwright/test"
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

test.describe("Button", () => {
  test("renders and is clickable", async ({ page }) => {
    await open(page, "primitives-button--secondary")
    const button = page.getByRole("button", { name: "Secundário" })
    await expect(button).toBeEnabled()
    await button.click()
  })

  test("loading state has aria-busy and is not clickable", async ({ page }) => {
    await open(page, "primitives-button--loading-variants")
    const button = page.getByRole("button", { name: "outline" })
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute("aria-busy", "true")
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

  test("password toggle changes input type", async ({ page }) => {
    await open(page, "primitives-input--password-toggle")
    // `exact`: the toggle button is named "Mostrar senha", which also contains "Senha".
    const input = page.getByLabel("Senha", { exact: true })
    await expect(input).toHaveAttribute("type", "password")
    await page.getByRole("button", { name: "Mostrar senha" }).click()
    await expect(input).toHaveAttribute("type", "text")
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
