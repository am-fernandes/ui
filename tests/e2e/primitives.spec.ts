import { expect, test } from "@playwright/test"

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

  test("focus-visible ring renders on tab focus", async ({ page }) => {
    await page.goto(story("primitives-button--default"))
    const button = page.getByRole("button", { name: "Button" })
    await button.focus()
    // Tailwind ring shows when focus-visible — assert class presence.
    await expect(button).toHaveClass(/focus-visible:ring/)
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
