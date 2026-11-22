import { type Locator, expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

/** Puts the caret where a click would, without depending on glyph widths. */
async function caretAt(input: Locator, position: number) {
  await input.evaluate((el: HTMLInputElement, pos) => {
    el.focus()
    el.setSelectionRange(pos, pos)
  }, position)
}

const caretOf = (input: Locator) => input.evaluate((el: HTMLInputElement) => el.selectionStart)

// jsdom cannot prove where a real browser leaves the caret after React
// rewrites the value, so the masked inputs are edited here with real keys.
test.describe("Campos com máscara: editar no meio", () => {
  test("CPF: Backspace no meio apaga aquele dígito e o próximo entra no mesmo ponto", async ({
    page,
  }) => {
    await page.goto(story("domain-cpfinput--with-validation-feedback"))
    const input = page.getByRole("textbox", { name: "CPF" })
    await input.pressSequentially("52998224725")
    await expect(input).toHaveValue("529.982.247-25")

    await caretAt(input, 2)
    await page.keyboard.press("Backspace")
    await expect(input).toHaveValue("599.822.472-5")
    expect(await caretOf(input)).toBe(1)

    await page.keyboard.type("2")
    await expect(input).toHaveValue("529.982.247-25")
    expect(await caretOf(input)).toBe(2)
    await expect(page.getByText("válido: true")).toBeVisible()
  })

  test("CPF: Backspace logo depois do ponto apaga o dígito antes dele", async ({ page }) => {
    await page.goto(story("domain-cpfinput--filled"))
    const input = page.getByRole("textbox", { name: "CPF" })
    await expect(input).toHaveValue("123.456.789-09")
    // "123.|456.789-09"
    await caretAt(input, 4)
    await page.keyboard.press("Backspace")
    await expect(input).toHaveValue("124.567.890-9")
    expect(await caretOf(input)).toBe(2)
  })

  test("CPF: Delete logo antes do ponto apaga o dígito depois dele", async ({ page }) => {
    await page.goto(story("domain-cpfinput--filled"))
    const input = page.getByRole("textbox", { name: "CPF" })
    await expect(input).toHaveValue("123.456.789-09")
    // "123|.456.789-09"
    await caretAt(input, 3)
    await page.keyboard.press("Delete")
    await expect(input).toHaveValue("123.567.890-9")
    expect(await caretOf(input)).toBe(3)
  })

  const middleEdits = [
    {
      name: "CNPJ",
      id: "domain-cnpjinput--filled",
      label: "CNPJ",
      initial: "11.222.333/0001-81",
      // "11.2|22.333/0001-81"
      caret: 4,
      afterBackspace: "11.223.330/0018-1",
      caretAfterBackspace: 3,
      retype: "2",
      caretAfterRetype: 4,
    },
    {
      name: "CEP",
      id: "domain-cepinput--filled",
      label: "CEP",
      initial: "01310-100",
      // "01|310-100"
      caret: 2,
      afterBackspace: "03101-00",
      caretAfterBackspace: 1,
      retype: "1",
      caretAfterRetype: 2,
    },
    {
      name: "Telefone",
      id: "domain-phoneinput--filled",
      label: "Telefone",
      initial: "(11) 98765-4321",
      // "(11|) 98765-4321"
      caret: 3,
      afterBackspace: "(19) 8765-4321",
      caretAfterBackspace: 2,
      retype: "1",
      caretAfterRetype: 3,
    },
  ]

  for (const edit of middleEdits) {
    test(`${edit.name}: o cursor fica no lugar ao apagar e redigitar no meio`, async ({ page }) => {
      await page.goto(story(edit.id))
      const input = page.getByRole("textbox", { name: edit.label })
      await expect(input).toHaveValue(edit.initial)

      await caretAt(input, edit.caret)
      await page.keyboard.press("Backspace")
      await expect(input).toHaveValue(edit.afterBackspace)
      expect(await caretOf(input)).toBe(edit.caretAfterBackspace)

      await page.keyboard.type(edit.retype)
      await expect(input).toHaveValue(edit.initial)
      expect(await caretOf(input)).toBe(edit.caretAfterRetype)
    })
  }
})

test.describe("CurrencyInput", () => {
  test("typing digits formats to BRL display", async ({ page }) => {
    // `Playground` has no play function; `Default` types by itself and would race.
    await page.goto(story("domain-currencyinput--playground"))
    const input = page.getByRole("textbox", { name: /Valor do contrato/ })
    await expect(input).toHaveValue("0,00")
    // A scripted focus leaves the caret at the start; a person types at the end.
    await input.press("End")
    await input.pressSequentially("123456")
    // Display formatted as 1.234,56
    await expect(input).toHaveValue("1.234,56")
  })
})

test.describe("PercentageInput", () => {
  test("never goes above max", async ({ page }) => {
    await page.goto(story("domain-percentageinput--default"))
    const input = page.getByRole("textbox", { name: /Comissão/ })
    await expect(input).toHaveValue("0,00")
    await input.press("End")
    await input.pressSequentially("99999")
    // Default max=100: the field never shows more than 100,00.
    await expect(input).not.toHaveValue("0,00")
    const value = await input.inputValue()
    const numeric = Number.parseFloat(value.replace(".", "").replace(",", "."))
    expect(numeric).toBeLessThanOrEqual(100)
  })
})

test.describe("MultiInput", () => {
  test("Enter commits a tag", async ({ page }) => {
    await page.goto(story("domain-multiinput--string-tags"))
    const input = page.getByRole("textbox").first()
    await input.fill("playwright")
    await input.press("Enter")
    // The new tag should appear as a Badge
    await expect(page.getByText("playwright")).toBeVisible()
  })

  test("Backspace removes last tag from empty input", async ({ page }) => {
    await page.goto(story("domain-multiinput--string-tags"))
    const input = page.getByRole("textbox").first()
    await input.fill("removeme")
    await input.press("Enter")
    await expect(page.getByText("removeme")).toBeVisible()
    // Now empty input + backspace removes
    await input.press("Backspace")
    await expect(page.getByText("removeme")).not.toBeVisible({ timeout: 2000 })
  })
})

test.describe("InputOTP", () => {
  test("typing 6 digits fires onComplete", async ({ page }) => {
    await page.goto(story("domain-inputotp--default"))
    // input-otp library renders an invisible input that captures keystrokes
    const input = page.getByRole("textbox").first()
    await input.fill("123456")
    const slots = page.locator('[data-slot="input-otp-slot"]')
    await expect(slots).toHaveCount(6)
    // First slot has "1"
    await expect(slots.nth(0)).toContainText("1")
    await expect(slots.nth(5)).toContainText("6")
  })
})
