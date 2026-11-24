import { type Locator, type Page, expect, test } from "@playwright/test"
import { expectFocusRing, expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=primitives-slider--${id}&viewMode=story`

async function open(page: Page, id: string) {
  await page.goto(story(id))
  await expect(page.getByRole("slider").first()).toBeVisible({ timeout: 15_000 })
}

const centerX = async (locator: Locator) => {
  const box = (await locator.boundingBox())!
  return box.x + box.width / 2
}

test.describe("Slider — pointer", () => {
  test("dragging the thumb moves the value, snapped to the step", async ({ page }) => {
    await open(page, "with-value")
    const thumb = page.getByRole("slider", { name: "Área mínima" })
    const track = (await page.locator('[data-slot="slider"]').boundingBox())!
    const thumbBox = (await thumb.boundingBox())!
    await page.mouse.move(thumbBox.x + 12, thumbBox.y + 12)
    await page.mouse.down()
    // Radix maps the pointer over the whole track: 76% of it is 380.
    await page.mouse.move(track.x + track.width * 0.76, track.y + track.height / 2, { steps: 8 })
    await page.mouse.up()
    await expect(thumb).toHaveAttribute("aria-valuenow", "380")
    await expect(page.locator('[data-slot="slider-value"]')).toHaveText("380 m²")
  })

  test("a click on the track takes the thumb there", async ({ page }) => {
    await open(page, "default")
    const track = (await page.locator('[data-slot="slider"]').boundingBox())!
    await page.mouse.click(track.x + 12 + (track.width - 24) * 0.5, track.y + track.height / 2)
    await expect(page.getByRole("slider")).toHaveAttribute("aria-valuenow", "250")
  })

  test("the thumb is a 24px target", async ({ page }) => {
    await open(page, "default")
    const box = (await page.getByRole("slider").boundingBox())!
    expect([box.width, box.height]).toEqual([24, 24])
  })
})

test.describe("Slider — keyboard", () => {
  test("arrows step, PageUp/PageDown step ten, Home/End go to the ends, with a focus ring", async ({
    page,
  }) => {
    await open(page, "default")
    const thumb = page.getByRole("slider", { name: "Área mínima" })
    await page.keyboard.press("Tab")
    await expect(thumb).toBeFocused()
    await expectFocusRing(thumb)
    await page.keyboard.press("ArrowRight")
    await expect(thumb).toHaveAttribute("aria-valuenow", "130")
    await page.keyboard.press("PageUp")
    await expect(thumb).toHaveAttribute("aria-valuenow", "230")
    await page.keyboard.press("End")
    await expect(thumb).toHaveAttribute("aria-valuenow", "500")
    await page.keyboard.press("Home")
    await expect(thumb).toHaveAttribute("aria-valuenow", "0")
  })

  test("range: each thumb has its name, and the values stay in order", async ({ page }) => {
    await open(page, "price-range")
    const low = page.getByRole("slider", { name: "Preço mínimo" })
    const high = page.getByRole("slider", { name: "Preço máximo" })
    await expect(low).toHaveAttribute("aria-valuetext", /^R\$\s300\.000$/)
    await low.focus()
    await page.keyboard.press("ArrowRight")
    await expect(low).toHaveAttribute("aria-valuenow", "350000")
    await expect(page.locator('[data-slot="slider-value"]')).toHaveText(
      /^R\$\s350\.000 – R\$\s800\.000$/,
    )
    // Pushed past the other, the minimum hands over: the maximum takes the
    // value and the focus, so "mínimo" is never above "máximo".
    await page.keyboard.press("End")
    await expect(high).toHaveAttribute("aria-valuenow", "2000000")
    await expect(high).toBeFocused()
    await expect(low).toHaveAttribute("aria-valuenow", "350000")
  })
})

test.describe("Slider — marks and layout", () => {
  test("each mark sits under the thumb at its value", async ({ page }) => {
    await open(page, "with-marks")
    const thumb = page.getByRole("slider", { name: "Vagas de garagem" })
    const ticks = page.locator('[data-slot="slider-mark"]')
    await thumb.focus()
    await page.keyboard.press("Home")
    for (let value = 0; value <= 4; value++) {
      await expect(thumb).toHaveAttribute("aria-valuenow", String(value))
      const tick = await centerX(ticks.nth(value))
      expect(Math.abs((await centerX(thumb)) - tick), `value ${value}`).toBeLessThanOrEqual(1)
      await page.keyboard.press("ArrowRight")
    }
  })

  test("at 360px the track and the end labels stay inside the field", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await open(page, "with-marks")
    const field = (await page.locator('[data-slot="slider-field"]').boundingBox())!
    expect(field.x).toBeGreaterThanOrEqual(0)
    expect(field.x + field.width).toBeLessThanOrEqual(360)
    const last = (await page.getByText("4 ou mais").boundingBox())!
    const first = (await page
      .locator('[data-slot="slider-mark"]')
      .first()
      .getByText("0")
      .boundingBox())!
    expect(last.x + last.width).toBeLessThanOrEqual(field.x + field.width + 0.5)
    expect(first.x).toBeGreaterThanOrEqual(field.x - 0.5)
  })

  test("in forced colours the filled part and the thumb stay visible", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" })
    await open(page, "default")
    const [range, track, thumbBorder] = await Promise.all([
      page
        .locator('[data-slot="slider-range"]')
        .evaluate((el) => getComputedStyle(el).backgroundColor),
      page
        .locator('[data-slot="slider-track"]')
        .evaluate((el) => getComputedStyle(el).borderTopStyle),
      page.getByRole("slider").evaluate((el) => getComputedStyle(el).borderTopStyle),
    ])
    const canvas = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(range).not.toBe(canvas)
    expect(track).toBe("solid")
    expect(thumbBorder).toBe("solid")
    await page.emulateMedia({ forcedColors: "none" })
  })
})

test.describe("Slider — form", () => {
  test("FormData carries the values, a range twice, and reset restores them", async ({ page }) => {
    await open(page, "in-form")
    const area = page.getByRole("slider", { name: "Área mínima" })
    await area.focus()
    await page.keyboard.press("ArrowRight")
    await page.getByRole("button", { name: "Enviar" }).click()
    await expect(page.getByTestId("sent")).toHaveText("Enviado: area=130; preco=300000,800000")
    await page.getByRole("button", { name: "Restaurar" }).click()
    await expect(area).toHaveAttribute("aria-valuenow", "120")
    await page.getByRole("button", { name: "Enviar" }).click()
    await expect(page.getByTestId("sent")).toHaveText("Enviado: area=120; preco=300000,800000")
  })
})

test.describe("Slider — accessibility", () => {
  for (const id of [
    "default",
    "with-value",
    "with-description",
    "with-error",
    "price-range",
    "with-marks",
  ]) {
    test(`${id} has no WCAG 2.1 AA violations`, async ({ page }) => {
      await open(page, id)
      await expectNoA11yViolations(page, '[data-slot="slider-field"]')
    })
  }

  test("disabled is marked for screen readers and has no WCAG 2.1 AA violations", async ({
    page,
  }) => {
    await open(page, "disabled")
    const thumb = page.getByRole("slider", { name: "Área mínima" })
    await expect(thumb).toHaveAttribute("aria-disabled", "true")
    await expect(thumb).not.toHaveAttribute("tabindex")
    // The dimmed readout is text of an inactive component (WCAG 1.4.3
    // exception). axe exempts the label, which names the disabled thumb, but
    // cannot tie the aria-hidden readout to it.
    await expectNoA11yViolations(page, {
      include: [['[data-slot="slider-field"]']],
      exclude: [['[data-slot="slider-value"]']],
    })
  })
})
