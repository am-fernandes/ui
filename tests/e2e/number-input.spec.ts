import { type Page, expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=primitives-numberinput--${id}&viewMode=story`

async function open(page: Page, id: string) {
  await page.goto(story(id))
  await expect(page.getByRole("spinbutton").first()).toBeVisible({ timeout: 15_000 })
}

test.describe("NumberInput — typing", () => {
  test("formats on blur, edits plain, and keeps the caret where a refused key was", async ({
    page,
  }) => {
    await open(page, "area-with-unit")
    const field = page.getByRole("spinbutton", { name: "Área privativa" })
    await expect(field).toHaveValue("1.250,5")
    await field.click()
    await expect(field).toHaveValue("1250,5")
    await field.press("End")
    // Caret before the comma: a letter there is dropped and the caret stays.
    for (let i = 0; i < 2; i++) await field.press("ArrowLeft")
    await page.keyboard.type("x9")
    await expect(field).toHaveValue("12509,5")
    await field.blur()
    await expect(field).toHaveValue("12.509,5")
    await expect(field).toHaveAttribute("aria-valuetext", "12.509,5 m²")
  })

  test("keeps an out-of-range value and shows the limit on blur", async ({ page }) => {
    await open(page, "floor-range")
    const field = page.getByRole("spinbutton", { name: "Andar" })
    await field.fill("")
    await field.pressSequentially("99")
    await expect(page.getByRole("alert")).toHaveCount(0)
    await field.blur()
    await expect(field).toHaveValue("99")
    await expect(page.getByRole("alert")).toHaveText("O valor máximo é 40.")
    await expect(field).toHaveAttribute("aria-invalid", "true")
  })

  test("pastes with the library's rule", async ({ page }) => {
    await open(page, "area-with-unit")
    const field = page.getByRole("spinbutton", { name: "Área privativa" })
    await field.focus()
    for (const [text, shown] of [
      ["1.234,56", "1234,56"],
      ["2350.9", "2350,9"],
      ["350.000", "350000"],
      ["R$ 72", "72"],
    ]) {
      await field.evaluate((el, pasted) => {
        const data = new DataTransfer()
        data.setData("text/plain", pasted)
        el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true }))
      }, text)
      await expect(field, text).toHaveValue(shown)
    }
  })
})

test.describe("NumberInput — keyboard and pointer", () => {
  test("arrows step one, PageUp/PageDown ten, Home/End go to min/max", async ({ page }) => {
    await open(page, "floor-range")
    const field = page.getByRole("spinbutton", { name: "Andar" })
    await field.focus()
    await field.press("ArrowUp")
    await expect(field).toHaveValue("13")
    await field.press("PageDown")
    await expect(field).toHaveValue("3")
    await field.press("Home")
    await expect(field).toHaveValue("-3")
    await field.press("End")
    await expect(field).toHaveValue("40")
    await expect(field).toHaveAttribute("aria-valuenow", "40")
  })

  test("the wheel over the focused field changes nothing", async ({ page }) => {
    await open(page, "steppers")
    const field = page.getByRole("spinbutton", { name: "Vagas de garagem" })
    await field.focus()
    await field.hover()
    await page.mouse.wheel(0, -300)
    await page.mouse.wheel(0, 300)
    await expect(field).toHaveValue("2")
  })

  test("steppers are 24px, keep the focus in the field, and repeat while held", async ({
    page,
  }) => {
    await open(page, "installments")
    const field = page.getByRole("spinbutton", { name: "Parcelas" })
    const minus = page.getByRole("button", { name: "Diminuir" })
    const box = (await minus.boundingBox())!
    expect([box.width, box.height]).toEqual([24, 24])
    await field.focus()
    await minus.click()
    await expect(field).toBeFocused()
    await expect(field).toHaveValue("348")
    // Held for a second: the first step, then one every 80ms after 400ms.
    await minus.hover()
    await page.mouse.down()
    await page.waitForTimeout(1000)
    await page.mouse.up()
    const held = Number(await field.inputValue())
    expect(held).toBeLessThanOrEqual(348 - 12 * 5)
    await page.waitForTimeout(300)
    expect(Number(await field.inputValue())).toBe(held)
    await expect(field).toBeFocused()
  })

  test("the + stepper stops at max", async ({ page }) => {
    await open(page, "steppers")
    const plus = page.getByRole("button", { name: "Aumentar" })
    for (let i = 0; i < 6; i++) if (await plus.isEnabled()) await plus.click()
    await expect(page.getByRole("spinbutton")).toHaveValue("6")
    await expect(plus).toBeDisabled()
  })
})

test.describe("NumberInput — form and layout", () => {
  test("sends the raw number with a dot, and empty as empty", async ({ page }) => {
    await open(page, "in-form")
    await page.getByRole("button", { name: "Enviar" }).click()
    await expect(page.getByTestId("sent")).toHaveText("Enviado: area=1250.5; vagas=")
  })

  test("the box is as tall as an Input of the same size, steppers included", async ({ page }) => {
    await open(page, "sizes")
    for (const [size, px] of [
      ["sm", 32],
      ["md", 40],
      ["lg", 44],
    ] as const) {
      const wrapper = (name: string, role: "spinbutton" | "textbox") =>
        page
          .locator('[data-slot="input-wrapper"]')
          .filter({ has: page.getByRole(role, { name }) })
          .boundingBox()
      expect((await wrapper(`Number ${size}`, "spinbutton"))?.height, size).toBe(px)
      expect((await wrapper(`Input ${size}`, "textbox"))?.height, size).toBe(px)
    }
  })

  test("at 360px the field and its steppers fit", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await open(page, "floor-range")
    const box = (await page.locator('[data-slot="input-wrapper"]').boundingBox())!
    const plus = (await page.getByRole("button", { name: "Aumentar" }).boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(360)
    expect(plus.x + plus.width).toBeLessThanOrEqual(box.x + box.width)
  })
})

test.describe("NumberInput — accessibility", () => {
  for (const id of [
    "with-description",
    "with-error",
    "required",
    "read-only",
    "disabled",
    "area-with-unit",
    "steppers",
    "floor-range",
  ]) {
    test(`${id} has no WCAG 2.1 AA violations`, async ({ page }) => {
      await open(page, id)
      await expectNoA11yViolations(page, '[data-slot="field-shell"]')
    })
  }
})
