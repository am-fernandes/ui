import { type Locator, type Page, expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

/**
 * Opens a story and waits until it is mounted. Storybook's dev server may
 * still be compiling on the first hit, and on a busy machine that takes longer
 * than the 5s an assertion waits.
 */
async function gotoStory(page: Page, id: string) {
  await page.goto(story(id))
  await page.waitForFunction(
    () =>
      document.body.classList.contains("sb-show-main") &&
      !document.body.classList.contains("sb-show-preparing-story") &&
      !!document.getElementById("storybook-root")?.firstChild,
    null,
    { timeout: 30_000 },
  )
}

/** Puts the caret where a click would, without depending on glyph widths. */
async function caretAt(input: Locator, position: number) {
  await input.evaluate((el: HTMLInputElement, pos) => {
    el.focus()
    el.setSelectionRange(pos, pos)
  }, position)
}

const caretOf = (input: Locator) => input.evaluate((el: HTMLInputElement) => el.selectionStart)

/** A real paste: the text goes to the clipboard and Ctrl+V brings it in. */
async function paste(page: Page, text: string) {
  await page.evaluate((value) => navigator.clipboard.writeText(value), text)
  await page.keyboard.press("ControlOrMeta+V")
}

// jsdom cannot prove where a real browser leaves the caret after React
// rewrites the value, so the masked inputs are edited here with real keys.
test.describe("Campos com máscara: editar no meio", () => {
  test("CPF: Backspace no meio apaga aquele dígito e o próximo entra no mesmo ponto", async ({
    page,
  }) => {
    await gotoStory(page, "domain-cpfinput--with-validation-feedback")
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
    await gotoStory(page, "domain-cpfinput--filled")
    const input = page.getByRole("textbox", { name: "CPF" })
    await expect(input).toHaveValue("123.456.789-09")
    // "123.|456.789-09"
    await caretAt(input, 4)
    await page.keyboard.press("Backspace")
    await expect(input).toHaveValue("124.567.890-9")
    expect(await caretOf(input)).toBe(2)
  })

  test("CPF: Delete logo antes do ponto apaga o dígito depois dele", async ({ page }) => {
    await gotoStory(page, "domain-cpfinput--filled")
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
      await gotoStory(page, edit.id)
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

// A synthetic paste event does not go through the browser's own handling of
// maxLength and of the selection, which is where the digits were lost.
test.describe("Campos com máscara: colar", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
  })

  const pastes = [
    {
      name: "CPF com espaço na frente",
      id: "domain-cpfinput--with-validation-feedback",
      label: "CPF",
      text: " 529.982.247-25",
      shown: "529.982.247-25",
      digits: "52998224725",
    },
    {
      name: "CPF com rótulo na frente",
      id: "domain-cpfinput--with-validation-feedback",
      label: "CPF",
      text: "CPF: 529.982.247-25",
      shown: "529.982.247-25",
      digits: "52998224725",
    },
    {
      name: "CNPJ com rótulo e espaço na frente",
      id: "domain-cnpjinput--with-validation-feedback",
      label: "CNPJ",
      text: " CNPJ: 11.222.333/0001-81",
      shown: "11.222.333/0001-81",
      digits: "11222333000181",
    },
    {
      name: "CEP no fim de um endereço",
      id: "domain-cepinput--with-validation-feedback",
      label: "CEP",
      text: "Av. Paulista, 1578 - Bela Vista, São Paulo - SP, 01310-200",
      shown: "01310-200",
      digits: "01310200",
    },
    {
      name: "telefone com +55",
      id: "domain-phoneinput--with-validation-feedback",
      label: "Telefone",
      text: "+55 11 98765-4321",
      shown: "(11) 98765-4321",
      digits: "11987654321",
    },
    {
      name: "telefone com zero de operadora",
      id: "domain-phoneinput--with-validation-feedback",
      label: "Telefone",
      text: "011 98765-4321",
      shown: "(11) 98765-4321",
      digits: "11987654321",
    },
  ]

  for (const item of pastes) {
    test(`${item.name}: o número colado entra inteiro`, async ({ page }) => {
      await gotoStory(page, item.id)
      const input = page.getByRole("textbox", { name: item.label })
      await input.click()
      await paste(page, item.text)
      await expect(input).toHaveValue(item.shown)
      await expect(page.getByText(`Dígitos: ${item.digits} — válido: true`)).toBeVisible()
    })
  }

  test("um CPF completo colado substitui o que já estava no campo", async ({ page }) => {
    await gotoStory(page, "domain-cpfinput--filled")
    const input = page.getByRole("textbox", { name: "CPF" })
    await expect(input).toHaveValue("123.456.789-09")
    await input.click()
    await paste(page, "529.982.247-25")
    await expect(input).toHaveValue("529.982.247-25")
  })

  test("um pedaço colado entra no ponto do cursor", async ({ page }) => {
    await gotoStory(page, "domain-cpfinput--with-validation-feedback")
    const input = page.getByRole("textbox", { name: "CPF" })
    await input.pressSequentially("529247")
    await expect(input).toHaveValue("529.247")
    // "529|.247"
    await caretAt(input, 3)
    await paste(page, "982")
    await expect(input).toHaveValue("529.982.247")
    expect(await caretOf(input)).toBe(7)
  })

  test("digitar num campo cheio não troca nenhum dígito", async ({ page }) => {
    await gotoStory(page, "domain-cpfinput--filled")
    const input = page.getByRole("textbox", { name: "CPF" })
    await expect(input).toHaveValue("123.456.789-09")
    await caretAt(input, 2)
    await page.keyboard.type("7")
    await expect(input).toHaveValue("123.456.789-09")
    expect(await caretOf(input)).toBe(2)
  })
})

test.describe("Tamanho dos campos", () => {
  const stories = [
    { name: "CPFInput", id: "domain-cpfinput--sizes", label: "CPF" },
    { name: "CNPJInput", id: "domain-cnpjinput--sizes", label: "CNPJ" },
    { name: "CEPInput", id: "domain-cepinput--sizes", label: "CEP" },
    { name: "PhoneInput", id: "domain-phoneinput--sizes", label: "Telefone" },
    { name: "CurrencyInput", id: "domain-currencyinput--sizes", label: "Valor" },
    { name: "PercentageInput", id: "domain-percentageinput--sizes", label: "Taxa" },
  ]

  for (const item of stories) {
    test(`${item.name}: sm, md e lg medem 32, 40 e 44px`, async ({ page }) => {
      await gotoStory(page, item.id)
      const heights: Record<string, number> = {}
      for (const size of ["sm", "md", "lg"]) {
        const box = await page
          .getByRole("textbox", { name: `${item.label} (${size})` })
          .boundingBox()
        heights[size] = box?.height ?? 0
      }
      expect(heights).toEqual({ sm: 32, md: 40, lg: 44 })
    })
  }

  test("o texto fixo (R$ e %) não fica por cima do valor em nenhum tamanho", async ({ page }) => {
    for (const [id, text] of [
      ["domain-currencyinput--sizes", "R$"],
      ["domain-percentageinput--sizes", "%"],
    ] as const) {
      await gotoStory(page, id)
      const wrappers = page.locator(
        `[data-slot="${id.includes("currency") ? "currency" : "percentage"}-input"]`,
      )
      await expect(wrappers).toHaveCount(3)
      for (let i = 0; i < 3; i++) {
        const wrapper = wrappers.nth(i)
        const adornment = await wrapper.getByText(text, { exact: true }).boundingBox()
        // Where the value text starts and ends inside the input.
        const value = await wrapper.locator("input[type=text]").evaluate((el: HTMLInputElement) => {
          const style = getComputedStyle(el)
          const rect = el.getBoundingClientRect()
          return {
            start: rect.left + Number.parseFloat(style.paddingLeft),
            end: rect.right - Number.parseFloat(style.paddingRight),
          }
        })
        if (!adornment) throw new Error("sem caixa para medir")
        if (text === "R$") expect(adornment.x + adornment.width).toBeLessThanOrEqual(value.start)
        else expect(adornment.x).toBeGreaterThanOrEqual(value.end)
      }
    }
  })
})

// Looks are measured here: jsdom has no stylesheet.
test.describe("Somente leitura", () => {
  const stories = [
    { name: "CPFInput", id: "domain-cpfinput--read-only", label: "CPF", shown: "529.982.247-25" },
    {
      name: "CurrencyInput",
      id: "domain-currencyinput--read-only",
      label: "Valor do contrato",
      shown: "1.234,56",
    },
  ]

  // "none", or a ring whose colour is fully transparent.
  const hasVisibleRing = (input: Locator) =>
    input.evaluate((el) => {
      const shadow = getComputedStyle(el).boxShadow
      if (shadow === "none") return false
      return !/rgba\(\s*0,\s*0,\s*0,\s*0\)|\/\s*0\)|transparent/.test(shadow)
    })

  for (const item of stories) {
    test(`${item.name}: parece diferente do editável, não reage ao hover e não edita`, async ({
      page,
    }) => {
      await gotoStory(page, item.id)
      const editable = page.getByRole("textbox", { name: `${item.label} (editável)` })
      const readOnly = page.getByRole("textbox", { name: `${item.label} (somente leitura)` })
      await expect(readOnly).toHaveValue(item.shown)

      const background = (input: Locator) =>
        input.evaluate((el) => getComputedStyle(el).backgroundColor)
      expect(await background(readOnly)).not.toBe(await background(editable))

      // Not the disabled look: the field is fully opaque.
      const opacity = await readOnly.evaluate((el) => {
        let value = 1
        for (let node: Element | null = el; node; node = node.parentElement) {
          value *= Number(getComputedStyle(node).opacity)
        }
        return value
      })
      expect(opacity).toBe(1)

      await editable.hover()
      await expect.poll(() => hasVisibleRing(editable)).toBe(true)
      await readOnly.hover()
      await expect.poll(() => hasVisibleRing(readOnly)).toBe(false)

      // Focusable, and the keyboard does not change it.
      await editable.focus()
      await page.keyboard.press("Tab")
      await expect(readOnly).toBeFocused()
      await expect.poll(() => hasVisibleRing(readOnly)).toBe(true)
      await page.keyboard.press("End")
      await page.keyboard.type("9")
      await page.keyboard.press("Backspace")
      await expect(readOnly).toHaveValue(item.shown)
    })
  }
})

test.describe("CEPInput: consulta de endereço", () => {
  test("o oitavo dígito dispara a consulta e o indicador aparece dentro do campo", async ({
    page,
  }) => {
    await gotoStory(page, "domain-cepinput--address-lookup")
    const input = page.getByRole("textbox", { name: "CEP" })
    const spinner = page.locator('[data-slot="cep-input-spinner"]')
    const address = page.getByTestId("address")

    await input.pressSequentially("0131010")
    await expect(spinner).toHaveCount(0)
    await expect(address).toHaveText("Endereço: (informe o CEP)")

    await input.pressSequentially("0")
    await expect(input).toHaveValue("01310-100")
    await expect(spinner).toBeVisible()
    await expect(input).toHaveAttribute("aria-busy", "true")
    await expect(page.getByRole("status")).toHaveText("Buscando endereço…")

    // O indicador fica dentro da caixa do campo, não ao lado dela.
    const field = await input.boundingBox()
    const icon = await spinner.boundingBox()
    if (!field || !icon) throw new Error("sem caixa para medir")
    expect(icon.x).toBeGreaterThan(field.x)
    expect(icon.x + icon.width).toBeLessThan(field.x + field.width)
    expect(icon.y).toBeGreaterThan(field.y)
    expect(icon.y + icon.height).toBeLessThan(field.y + field.height)

    await expect(address).toHaveText("Avenida Paulista, Bela Vista, São Paulo - SP")
    await expect(spinner).toHaveCount(0)
    await expect(input).not.toHaveAttribute("aria-busy", "true")
  })

  test("corrigir o CEP durante a consulta dispara outra", async ({ page }) => {
    await gotoStory(page, "domain-cepinput--address-lookup")
    const input = page.getByRole("textbox", { name: "CEP" })
    await input.pressSequentially("01310100")
    await expect(page.locator('[data-slot="cep-input-spinner"]')).toBeVisible()
    // O campo não trava enquanto carrega.
    await page.keyboard.press("Backspace")
    await page.keyboard.type("9")
    await expect(input).toHaveValue("01310-109")
    await expect(page.getByTestId("address")).toHaveText("CEP não encontrado")
  })
})

test.describe("CNPJInput: CNPJ alfanumérico", () => {
  test("aceita o exemplo oficial digitado, em maiúsculas, e ele valida", async ({ page }) => {
    await gotoStory(page, "domain-cnpjinput--with-validation-feedback")
    const input = page.getByRole("textbox", { name: "CNPJ" })
    await input.pressSequentially("12abc34501de35")
    await expect(input).toHaveValue("12.ABC.345/01DE-35")
    await expect(page.getByText("Dígitos: 12ABC34501DE35 — válido: true")).toBeVisible()
  })

  test("aceita o exemplo oficial colado com rótulo", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await gotoStory(page, "domain-cnpjinput--with-validation-feedback")
    const input = page.getByRole("textbox", { name: "CNPJ" })
    await input.click()
    await paste(page, "CNPJ: 12.ABC.345/01DE-35")
    await expect(input).toHaveValue("12.ABC.345/01DE-35")
    await expect(page.getByText("Dígitos: 12ABC34501DE35 — válido: true")).toBeVisible()
  })

  test("pede teclado de texto com maiúsculas", async ({ page }) => {
    await gotoStory(page, "domain-cnpjinput--alphanumeric")
    const input = page.getByRole("textbox", { name: "CNPJ" })
    await expect(input).toHaveValue("12.ABC.345/01DE-35")
    await expect(input).toHaveAttribute("inputmode", "text")
    await expect(input).toHaveAttribute("autocapitalize", "characters")
  })
})

test.describe("CurrencyInput", () => {
  test("typing digits formats to BRL display", async ({ page }) => {
    // `Playground` has no play function; `Default` types by itself and would race.
    await gotoStory(page, "domain-currencyinput--playground")
    const input = page.getByRole("textbox", { name: /Valor do contrato/ })
    await expect(input).toHaveValue("0,00")
    // A scripted focus leaves the caret at the start; a person types at the end.
    await input.press("End")
    await input.pressSequentially("123456")
    // Display formatted as 1.234,56
    await expect(input).toHaveValue("1.234,56")
  })
})

test.describe("CurrencyInput: colar", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
  })

  const pastes = [
    { text: "1500", shown: "1.500,00", value: "1500" },
    { text: "1.500", shown: "1.500,00", value: "1500" },
    { text: "350.000", shown: "350.000,00", value: "350000" },
    { text: "1500,5", shown: "1.500,50", value: "1500.5" },
    { text: "2350.9", shown: "2.350,90", value: "2350.9" },
    { text: "1.500,00", shown: "1.500,00", value: "1500" },
    { text: "1500.00", shown: "1.500,00", value: "1500" },
    { text: "R$ 2.350,90", shown: "2.350,90", value: "2350.9" },
  ]

  for (const item of pastes) {
    test(`"${item.text}" colado vira ${item.shown}`, async ({ page }) => {
      await gotoStory(page, "domain-currencyinput--playground")
      const input = page.getByRole("textbox", { name: /Valor do contrato/ })
      await input.click()
      await paste(page, item.text)
      await expect(input).toHaveValue(item.shown)
      await expect(page.getByText(`Valor interno: ${item.value}`, { exact: true })).toBeVisible()
    })
  }
})

test.describe("PercentageInput", () => {
  test("never goes above max", async ({ page }) => {
    await gotoStory(page, "domain-percentageinput--default")
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
    await gotoStory(page, "domain-multiinput--string-tags")
    const input = page.getByRole("textbox").first()
    await input.fill("playwright")
    await input.press("Enter")
    // The new tag should appear as a Badge
    await expect(page.getByText("playwright")).toBeVisible()
  })

  test("Backspace removes last tag from empty input", async ({ page }) => {
    await gotoStory(page, "domain-multiinput--string-tags")
    const input = page.getByRole("textbox").first()
    await input.fill("removeme")
    await input.press("Enter")
    await expect(page.getByText("removeme")).toBeVisible()
    // Now empty input + backspace removes
    await input.press("Backspace")
    await expect(page.getByText("removeme")).not.toBeVisible({ timeout: 2000 })
  })
})

test.describe("MultiInput: nome acessível e teclado", () => {
  test("o rótulo visível nomeia o campo de texto e o grupo", async ({ page }) => {
    await gotoStory(page, "domain-multiinput--string-tags")
    await expect(page.locator('[data-slot="multi-input"]')).toMatchAriaSnapshot(`
      - group "Tags do processo":
        - text: urgente
        - button "Remover urgente"
        - text: fiscal
        - button "Remover fiscal"
        - textbox "Tags do processo"
    `)
  })

  test("Enter e Espaço no botão de remover tiram o item e o foco segue para o vizinho", async ({
    page,
  }) => {
    await gotoStory(page, "domain-multiinput--string-tags")
    const group = page.getByRole("group", { name: "Tags do processo" })
    await page.keyboard.press("Tab")
    await expect(group.getByRole("button", { name: "Remover urgente" })).toBeFocused()

    await page.keyboard.press("Enter")
    await expect(group.getByText("urgente")).toHaveCount(0)
    await expect(group.getByRole("button", { name: "Remover fiscal" })).toBeFocused()

    await page.keyboard.press("Space")
    await expect(group.getByRole("button")).toHaveCount(0)
    await expect(page.getByRole("textbox", { name: "Tags do processo" })).toBeFocused()
  })

  test("Backspace e Delete no botão de remover também tiram o item", async ({ page }) => {
    await gotoStory(page, "domain-multiinput--string-tags")
    const group = page.getByRole("group", { name: "Tags do processo" })
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await expect(group.getByRole("button", { name: "Remover fiscal" })).toBeFocused()

    await page.keyboard.press("Backspace")
    await expect(group.getByText("fiscal")).toHaveCount(0)
    await expect(group.getByRole("button", { name: "Remover urgente" })).toBeFocused()

    await page.keyboard.press("Delete")
    await expect(group.getByRole("button")).toHaveCount(0)
    await expect(page.getByRole("textbox", { name: "Tags do processo" })).toBeFocused()
  })

  test("o clique no × remove o item sem tirar o foco do campo de texto", async ({ page }) => {
    await gotoStory(page, "domain-multiinput--string-tags")
    const input = page.getByRole("textbox", { name: "Tags do processo" })
    await input.click()
    await input.pressSequentially("pendente")
    await page.getByRole("button", { name: "Remover urgente" }).click()
    await expect(page.getByRole("button", { name: "Remover urgente" })).toHaveCount(0)
    // O texto em digitação continua no campo, sem virar item.
    await expect(input).toBeFocused()
    await expect(input).toHaveValue("pendente")
    await expect(page.getByRole("button", { name: "Remover pendente" })).toHaveCount(0)
  })
})

test.describe("InputOTP", () => {
  test("typing 6 digits fires onComplete", async ({ page }) => {
    await gotoStory(page, "domain-inputotp--default")
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
