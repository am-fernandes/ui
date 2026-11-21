import { expect, test } from "@playwright/test"
import { expectFocusRing } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

test.describe("Button", () => {
  test("default renders and is clickable", async ({ page }) => {
    await page.goto(story("primitives-button--default"))
    const button = page.getByRole("button", { name: "Button" })
    await expect(button).toBeEnabled()
    await button.click()
  })

  test("loading state has aria-busy and is not clickable", async ({ page }) => {
    await page.goto(story("primitives-button--loading"))
    const button = page.getByRole("button", { name: /Salvando/ })
    await expect(button).toBeDisabled()
    await expect(button).toHaveAttribute("aria-busy", "true")
    // Real browser: aria-busy + disabled prevents pointer interaction.
    // Clicking a disabled button must not trigger anything (no Playwright error).
  })

  test("disabled state blocks clicks", async ({ page }) => {
    await page.goto(story("primitives-button--disabled"))
    const button = page.getByRole("button", { name: "Indisponível" })
    await expect(button).toBeDisabled()
  })

  test("focus ring renders on Tab focus, not on a mouse click", async ({ page }) => {
    await page.goto(story("primitives-button--default"))
    const button = page.getByRole("button", { name: "Button" })
    await expect(button).toBeVisible({ timeout: 15_000 })
    // Start unfocused: the story may land with focus already on the button.
    await button.evaluate((el) => el.blur())
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
    await page.goto(story("primitives-checkbox--default"))
    const label = page.getByText("Aceito os termos")
    const box = page.getByRole("checkbox", { name: "Aceito os termos" })
    await expect(box).toHaveAttribute("aria-checked", "false")
    await label.click()
    await expect(box).toHaveAttribute("aria-checked", "true")
  })

  test("keyboard Space toggles", async ({ page }) => {
    await page.goto(story("primitives-checkbox--default"))
    const box = page.getByRole("checkbox", { name: "Aceito os termos" })
    await box.focus()
    await page.keyboard.press("Space")
    await expect(box).toHaveAttribute("aria-checked", "true")
  })
})

test.describe("Input", () => {
  test("typing updates the value", async ({ page }) => {
    await page.goto(story("primitives-input--default"))
    const input = page.getByLabel("Nome completo")
    await input.fill("João da Silva")
    await expect(input).toHaveValue("João da Silva")
  })

  test("error renders role=alert", async ({ page }) => {
    await page.goto(story("primitives-input--with-error"))
    await expect(page.getByRole("alert")).toBeVisible()
  })

  test("password toggle changes input type", async ({ page }) => {
    await page.goto(story("primitives-input--password-toggle"))
    const input = page.getByLabel("Senha")
    await expect(input).toHaveAttribute("type", "password")
    await page.getByRole("button", { name: "Mostrar senha" }).click()
    await expect(input).toHaveAttribute("type", "text")
  })
})

test.describe("SegmentedControl", () => {
  const open = async (page: import("@playwright/test").Page, id: string) => {
    await page.goto(story(id))
    await expect(page.getByRole("radiogroup")).toBeVisible({ timeout: 15_000 })
  }

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
