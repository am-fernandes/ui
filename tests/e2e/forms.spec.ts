import { type Page, expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

/**
 * Opens a story and waits until it is mounted (and, with `ready`, until that
 * text is on screen). Storybook's dev server may still be compiling on the
 * first hit, and on a busy machine that takes longer than the 5s an
 * assertion waits.
 */
async function gotoStory(page: Page, id: string, ready?: string) {
  await page.goto(story(id))
  await page.waitForFunction(
    () =>
      document.body.classList.contains("sb-show-main") &&
      !document.body.classList.contains("sb-show-preparing-story") &&
      !!document.getElementById("storybook-root")?.firstChild,
    null,
    { timeout: 30_000 },
  )
  if (ready) await expect(page.getByText(ready).first()).toBeVisible({ timeout: 15_000 })
}

test.describe("Calendar", () => {
  test("renders weekday grid in ptBR locale", async ({ page }) => {
    await page.goto(story("forms-calendar--single"))
    // ptBR weekday short labels (rendered by react-day-picker)
    const grid = page.getByRole("grid").first()
    await expect(grid).toBeVisible()
  })

  test("arrow keys, Home, End, PageUp and PageDown move the focus between days", async ({
    page,
  }) => {
    await gotoStory(page, "forms-calendar--single", "Selecionado:")
    const day = (iso: string) => page.locator(`button[data-day="${iso}"]`)
    await day("2025-06-10").focus()
    await page.keyboard.press("ArrowRight")
    await expect(day("2025-06-11")).toBeFocused()
    await page.keyboard.press("ArrowDown")
    await expect(day("2025-06-18")).toBeFocused()
    await page.keyboard.press("ArrowLeft")
    await expect(day("2025-06-17")).toBeFocused()
    await page.keyboard.press("Home")
    await expect(day("2025-06-15")).toBeFocused()
    await page.keyboard.press("End")
    await expect(day("2025-06-21")).toBeFocused()
    await page.keyboard.press("PageDown")
    await expect(day("2025-07-21")).toBeFocused()
    await expect(page.getByRole("grid", { name: /julho 2025/i })).toBeVisible()
    await page.keyboard.press("PageUp")
    await expect(day("2025-06-21")).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page.getByText("Selecionado: 21/06/2025")).toBeVisible()
  })

  test("a navegação e os dias têm nomes em português", async ({ page }) => {
    await gotoStory(page, "forms-calendar--single", "Selecionado:")
    await expect(page.getByRole("button", { name: "Ir para o mês anterior" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Ir para o próximo mês" })).toBeVisible()
    await expect(
      page.getByRole("button", { name: "domingo, 15 de junho de 2025, selecionado" }),
    ).toBeVisible()
    await expect(page.getByRole("button", { name: /Go to/ })).toHaveCount(0)
  })

  test("em cores forçadas, selecionado, intervalo e hoje continuam distinguíveis", async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: "active" })
    const outline = (iso: string) =>
      page.locator(`button[data-day="${iso}"]`).evaluate((el) => {
        const style = getComputedStyle(el)
        return { style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) }
      })

    await gotoStory(page, "forms-calendar--range", "22/06/2025")
    // Range of the story: 15/06 to 22/06/2025.
    expect((await outline("2025-06-15")).style).toBe("solid")
    expect((await outline("2025-06-15")).width).toBeGreaterThanOrEqual(2)
    expect((await outline("2025-06-22")).style).toBe("solid")
    expect((await outline("2025-06-18")).style).toBe("dashed")
    expect((await outline("2025-06-25")).style).toBe("none")

    await gotoStory(page, "forms-calendar--quick-nav-year-month")
    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    await page.getByRole("button", { name: "Ir para o próximo mês" }).waitFor()
    // Walk to the current month, where "today" is.
    for (
      let i = 0;
      i < 240 && (await page.locator(`button[data-day="${iso}"]`).count()) === 0;
      i++
    ) {
      await page.getByRole("button", { name: "Ir para o próximo mês" }).click()
    }
    const decoration = await page
      .locator(`button[data-day="${iso}"]`)
      .evaluate((el) => getComputedStyle(el).textDecorationLine)
    expect(decoration).toContain("underline")
  })

  test("navegação rápida: a grade de anos é uma parada de Tab, e as setas andam nela", async ({
    page,
  }) => {
    await gotoStory(page, "forms-calendar--quick-nav-year-month")
    await page.getByRole("button", { name: /junho 2025/i }).click()
    const years = page.getByRole("group", { name: "Escolher ano" })
    await expect(years.getByRole("button", { name: "2025" })).toBeFocused()
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")
    const target = years.getByRole("button", { name: "2037" })
    await expect(target).toBeFocused()
    // Scrolled into the grid's box.
    const gridBox = await years.boundingBox()
    const targetBox = await target.boundingBox()
    if (!gridBox || !targetBox) throw new Error("no box")
    expect(targetBox.y + targetBox.height).toBeLessThanOrEqual(gridBox.y + gridBox.height + 1)
    // One Tab leaves the 201 years.
    await page.keyboard.press("Shift+Tab")
    expect(await years.evaluate((el) => el.contains(document.activeElement))).toBe(false)
  })

  test("disabledDays=past disables past dates", async ({ page }) => {
    await page.goto(story("forms-calendar--disabled-past"))
    // At least one button has aria-disabled=true
    const disabledDay = page
      .locator('[aria-disabled="true"][role="gridcell"], [role="gridcell"][aria-disabled="true"]')
      .first()
    await expect(disabledDay.or(page.locator(".rdp-day_disabled").first())).toBeVisible({
      timeout: 3000,
    })
  })
})

test.describe("Combobox", () => {
  test("opens, filters, selects an option", async ({ page }) => {
    await page.goto(story("forms-combobox--default"))
    const trigger = page.getByRole("combobox").first()
    await trigger.click()
    // Type to filter
    const input = page.getByPlaceholder(/buscar/i)
    await expect(input).toBeVisible()
    await input.fill("são paulo")
    // First matching item
    const option = page.getByRole("option").first()
    if (await option.isVisible()) {
      await option.click()
    }
  })
})

test.describe("DateInput", () => {
  test("opens popover and selects a date", async ({ page }) => {
    await page.goto(story("forms-dateinput--default"))
    const trigger = page.getByRole("button").first()
    await trigger.click()
    const grid = page.getByRole("grid").first()
    await expect(grid).toBeVisible({ timeout: 3000 })
    // Click any non-outside day
    const days = page.locator("button[data-day]")
    await days.first().click()
    // Popover should close after selection
    await expect(grid).not.toBeVisible({ timeout: 3000 })
  })
})

test.describe("Combobox dentro de Dialog", () => {
  test("wheel rola a lista do dropdown e mantém o dialog aberto", async ({ page }) => {
    await page.goto(story("forms-combobox--inside-dialog"))
    await page.getByRole("button", { name: "Abrir dialog" }).click()
    await page.getByRole("combobox").click()
    const list = page.getByRole("listbox")
    await expect(list).toBeVisible()
    await list.hover()
    await page.mouse.wheel(0, 200)
    await expect.poll(() => list.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
    await expect(page.getByRole("dialog")).toBeVisible()
  })
})

test.describe("Combobox: limpar", () => {
  test("o botão de limpar é um alvo de 24px ao lado do gatilho", async ({ page }) => {
    await gotoStory(page, "forms-combobox--multi-select", "2 selecionados")
    const trigger = page.getByRole("combobox", { name: "Áreas" })
    const clear = page.getByRole("button", { name: "Limpar seleção" })
    const box = await clear.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(24)
    expect(box?.height).toBeGreaterThanOrEqual(24)
    // It sits inside the field's box, but is not part of the trigger button.
    const triggerBox = await trigger.boundingBox()
    if (!box || !triggerBox) throw new Error("no box")
    expect(box.y).toBeGreaterThanOrEqual(triggerBox.y)
    expect(box.y + box.height).toBeLessThanOrEqual(triggerBox.y + triggerBox.height)
    expect(await trigger.evaluate((el) => el.querySelector("[aria-label='Limpar seleção']"))).toBe(
      null,
    )

    await clear.click()
    await expect(trigger).toHaveText(/Selecione áreas/)
    await expect(trigger).toBeFocused()
  })
})

test.describe("Combobox: lista grande", () => {
  test("com 2.000 opções, abre e filtra montando no máximo 100", async ({ page }) => {
    await gotoStory(page, "forms-combobox--many-options", "Selecione uma unidade")
    await page.getByRole("combobox", { name: "Unidade" }).click()
    const list = page.getByRole("listbox")
    await expect(list).toBeVisible()
    await expect(list.getByRole("option")).toHaveCount(100)
    await expect(
      page.getByText("1.900 opções a mais. Continue digitando para filtrar."),
    ).toBeVisible()

    const search = page.getByPlaceholder("Buscar...")
    await search.pressSequentially("unidade 19")
    // 19, 190-199 and 1900-1999: 111 matches, 100 on screen.
    await expect(list.getByRole("option")).toHaveCount(100)
    await expect(page.getByText("11 opções a mais. Continue digitando para filtrar.")).toBeVisible()
    await search.pressSequentially("99")
    await expect(list.getByRole("option")).toHaveCount(1)
    await expect(list.getByRole("option", { name: "Unidade 1999" })).toBeVisible()
    await expect(page.getByText(/opções a mais/)).toHaveCount(0)

    await page.keyboard.press("Enter")
    await expect(page.getByRole("combobox", { name: "Unidade" })).toHaveText(/Unidade 1999/)
  })
})

test.describe("DateInput: digitar", () => {
  test("digitar 15031990 mostra 15/03/1990 e reporta 1990-03-15", async ({ page }) => {
    await gotoStory(page, "forms-dateinput--default", "ISO: (vazio)")
    const field = page.getByRole("textbox", { name: "Data de nascimento" })
    await field.click()
    await page.keyboard.type("15031990")
    await expect(field).toHaveValue("15/03/1990")
    await expect(page.getByText("ISO: 1990-03-15")).toBeVisible()

    // Editing in the middle keeps the caret where it was.
    await field.evaluate((el: HTMLInputElement) => el.setSelectionRange(5, 5))
    await page.keyboard.press("Backspace")
    await expect(field).toHaveValue("15/01/990")
    expect(await field.evaluate((el: HTMLInputElement) => el.selectionStart)).toBe(4)
    await page.keyboard.type("4")
    await expect(field).toHaveValue("15/04/1990")
    await expect(page.getByText("ISO: 1990-04-15")).toBeVisible()
  })

  test("o calendário abre no dia escolhido e Enter mantém a data", async ({ page }) => {
    await gotoStory(page, "forms-dateinput--default", "ISO: (vazio)")
    const field = page.getByRole("textbox", { name: "Data de nascimento" })
    await field.fill("")
    await field.pressSequentially("15031990")
    await page.getByRole("button", { name: "Abrir calendário" }).click()
    await expect(page.getByRole("grid", { name: /março 1990/i })).toBeVisible()
    await expect(page.locator('button[data-day="1990-03-15"]')).toBeFocused()
    await page.keyboard.press("ArrowRight")
    await expect(page.locator('button[data-day="1990-03-16"]')).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("grid")).toHaveCount(0)
    await expect(field).toHaveValue("16/03/1990")
    await expect(page.getByText("ISO: 1990-03-16")).toBeVisible()
  })
})

test.describe("Combobox: opção escolhida", () => {
  test("abre na escolhida, à vista, marcada na árvore de acessibilidade, e Enter mantém", async ({
    page,
  }) => {
    await gotoStory(page, "forms-combobox--opens-on-chosen", "Opção 30")
    const trigger = page.getByRole("combobox", { name: "Opção" })
    await trigger.click()
    const list = page.getByRole("listbox")
    await expect(list).toBeVisible()
    const chosen = list.getByRole("option", { name: "Opção 30", checked: true })
    await expect(chosen).toBeVisible()
    await expect(list.getByRole("option", { checked: true })).toHaveCount(1)
    await expect(chosen).toHaveAttribute("aria-selected", "true")

    // Scrolled into the list's box.
    await expect
      .poll(async () => {
        const listBox = await list.boundingBox()
        const itemBox = await chosen.boundingBox()
        if (!listBox || !itemBox) return false
        return itemBox.y >= listBox.y && itemBox.y + itemBox.height <= listBox.y + listBox.height
      })
      .toBe(true)

    await page.keyboard.press("Enter")
    await expect(list).toHaveCount(0)
    await expect(trigger).toHaveText(/Opção 30/)
  })
})

test.describe("Combobox: popover", () => {
  test("tem a largura do gatilho e aria-controls aponta para a lista", async ({ page }) => {
    await gotoStory(page, "forms-combobox--default", "Selecione um status")
    const trigger = page.getByRole("combobox", { name: "Status" })
    await trigger.click()
    const list = page.getByRole("listbox")
    await expect(list).toBeVisible()
    const content = page.locator('[data-slot="popover-content"]')
    await expect
      .poll(async () => {
        const a = await content.boundingBox()
        const b = await trigger.boundingBox()
        return a && b ? Math.round(Math.abs(a.width - b.width)) : -1
      })
      .toBe(0)
    const controls = await trigger.getAttribute("aria-controls")
    expect(controls).toBeTruthy()
    expect(await list.getAttribute("id")).toBe(controls)
  })
})

test.describe("Combobox: onBlur", () => {
  test("com react-hook-form em mode onBlur, valida ao sair do campo e não ao abrir a lista", async ({
    page,
  }) => {
    await gotoStory(page, "forms-combobox--with-rhf", "Enviar")
    const trigger = page.getByRole("combobox", { name: /Área de atuação/ })
    const error = page.getByText("Escolha uma área antes de enviar")
    await trigger.click()
    await expect(page.getByRole("listbox")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(trigger).toBeFocused()
    await expect(error).toHaveCount(0)
    await page.keyboard.press("Tab")
    await expect(error).toBeVisible()

    await trigger.click()
    await page.getByRole("option", { name: "Consultoria" }).click()
    await expect(trigger).toBeFocused()
    // The clear button is still the field; react-hook-form validates again
    // when the focus leaves it.
    await page.keyboard.press("Tab")
    await expect(page.getByRole("button", { name: "Limpar seleção" })).toBeFocused()
    await expect(error).toBeVisible()
    await page.keyboard.press("Tab")
    await expect(page.getByRole("button", { name: "Enviar" })).toBeFocused()
    await expect(error).toHaveCount(0)
  })
})

test.describe("Combobox: somente leitura", () => {
  test("fundo esmaecido, sem anel de hover, recebe foco e não abre", async ({ page }) => {
    await gotoStory(page, "forms-combobox--default", "Selecione um status")
    const editable = page.getByRole("combobox", { name: "Status" })
    const editableBg = await editable.evaluate((el) => getComputedStyle(el).backgroundColor)

    await gotoStory(page, "forms-combobox--read-only", "Aprovado")
    const trigger = page.getByRole("combobox", { name: "Status" })
    const look = () =>
      trigger.evaluate((el) => {
        const style = getComputedStyle(el)
        return { bg: style.backgroundColor, shadow: style.boxShadow }
      })
    const before = await look()
    expect(before.bg).not.toBe(editableBg)
    await trigger.hover()
    await page.waitForTimeout(250)
    // No visible ring: none, or one drawn in a fully transparent colour.
    expect((await look()).shadow).toMatch(/^(none|rgba\(0, 0, 0, 0\) .*)$/)

    await trigger.click()
    await expect(trigger).toBeFocused()
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await expect(page.getByRole("listbox")).toHaveCount(0)
    await expect(page.getByRole("button", { name: /Limpar|Remover/ })).toHaveCount(0)
  })
})

test.describe("Combobox: tamanhos", () => {
  test("sm, md e lg medem 32, 40 e 44 px, com o limpar dentro da caixa", async ({ page }) => {
    await gotoStory(page, "forms-combobox--sizes", "Tamanho lg")
    const heights = { sm: 32, md: 40, lg: 44 }
    for (const [size, height] of Object.entries(heights)) {
      const trigger = page.getByRole("combobox", { name: `Tamanho ${size}` })
      const box = await trigger.boundingBox()
      expect(box?.height, size).toBeCloseTo(height, 0)
      const clear = trigger.locator("xpath=..").getByRole("button", { name: "Limpar seleção" })
      const clearBox = await clear.boundingBox()
      if (!box || !clearBox) throw new Error("no box")
      expect(clearBox.y).toBeGreaterThanOrEqual(box.y)
      expect(clearBox.y + clearBox.height).toBeLessThanOrEqual(box.y + box.height)
      // The text ends before the clear button.
      const text = trigger.getByText("Pendente")
      const textBox = await text.boundingBox()
      expect((textBox?.x ?? 0) + (textBox?.width ?? 0)).toBeLessThanOrEqual(clearBox.x)
    }
  })
})

test.describe("DateInput: onBlur", () => {
  test("com react-hook-form em mode onBlur, valida ao sair do campo, não ao ir ao calendário", async ({
    page,
  }) => {
    await gotoStory(page, "forms-dateinput--with-rhf", "Enviar")
    const field = page.getByRole("textbox", { name: /Data de nascimento/ })
    const error = page.getByText("Informe a data de nascimento")
    await field.click()
    await page.keyboard.type("15")
    await page.keyboard.press("Tab")
    await expect(page.getByRole("button", { name: "Abrir calendário" })).toBeFocused()
    await expect(error).toHaveCount(0)
    await page.keyboard.press("Tab")
    await expect(error).toBeVisible()
    await expect(field).toHaveValue("15")

    await field.fill("")
    await field.pressSequentially("15031990")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await expect(error).toHaveCount(0)
    await page.getByRole("button", { name: "Enviar" }).click()
    await expect(page.getByText('Enviado: {"nascimento":"1990-03-15"}')).toBeVisible()
  })
})

test.describe("DateInput: somente leitura", () => {
  test("fundo esmaecido, sem anel de hover nem botão de calendário, e não aceita digitação", async ({
    page,
  }) => {
    await gotoStory(page, "forms-dateinput--default", "ISO: (vazio)")
    const editableBg = await page
      .getByRole("textbox", { name: "Data de nascimento" })
      .evaluate((el) => getComputedStyle(el).backgroundColor)

    await gotoStory(page, "forms-dateinput--read-only")
    const field = page.getByRole("textbox", { name: "Data de nascimento" })
    await expect(field).toHaveValue("15/03/1990")
    expect(await field.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(editableBg)
    await field.hover()
    await page.waitForTimeout(250)
    expect(await field.evaluate((el) => getComputedStyle(el).boxShadow)).toMatch(
      /^(none|rgba\(0, 0, 0, 0\) .*)$/,
    )
    await field.click()
    await expect(field).toBeFocused()
    await page.keyboard.press("Backspace")
    await page.keyboard.type("1")
    await expect(field).toHaveValue("15/03/1990")
    await expect(page.getByRole("button", { name: "Abrir calendário" })).toHaveCount(0)
  })
})

test.describe("DateInput: tamanhos", () => {
  test("sm, md e lg medem 32, 40 e 44 px, com o botão do calendário dentro da caixa", async ({
    page,
  }) => {
    await gotoStory(page, "forms-dateinput--sizes", "Tamanho lg")
    const heights = { sm: 32, md: 40, lg: 44 }
    for (const [size, height] of Object.entries(heights)) {
      const field = page.getByRole("textbox", { name: `Tamanho ${size}` })
      const box = await field.boundingBox()
      expect(box?.height, size).toBeCloseTo(height, 0)
      const button = field.locator("xpath=..").getByRole("button", { name: "Abrir calendário" })
      const buttonBox = await button.boundingBox()
      if (!box || !buttonBox) throw new Error("no box")
      expect(buttonBox.width).toBeGreaterThanOrEqual(24)
      expect(buttonBox.y).toBeGreaterThan(box.y)
      expect(buttonBox.y + buttonBox.height).toBeLessThan(box.y + box.height)
      expect(buttonBox.x + buttonBox.width).toBeLessThan(box.x + box.width)
    }
  })
})

test.describe("DateRangePicker", () => {
  test("abre no mês do período salvo", async ({ page }) => {
    await gotoStory(page, "forms-daterangepicker--controlled", "Janeiro/2025")
    await page.getByRole("button", { name: "Janeiro/2025" }).click()
    await page
      .getByRole("button", { name: /Período/ })
      .first()
      .click()
    await expect(page.getByRole("grid", { name: /janeiro 2025/i })).toBeVisible()
  })
})

test.describe("DateRangePicker: cabe na tela", () => {
  for (const viewport of [
    { width: 360, height: 740, months: 1 },
    { width: 1280, height: 800, months: 2 },
  ]) {
    test(`em ${viewport.width}×${viewport.height}, o popover fica inteiro na tela com ${viewport.months} mês(es)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await gotoStory(page, "forms-daterangepicker--default", "Selecione um período")
      await page.getByRole("button", { name: /Período/ }).click()
      await expect(page.getByRole("grid")).toHaveCount(viewport.months)
      const content = page.locator('[data-slot="popover-content"]')
      await expect
        .poll(async () => {
          const box = await content.boundingBox()
          return (
            !!box &&
            box.y >= 0 &&
            box.x >= 0 &&
            box.y + box.height <= viewport.height &&
            box.x + box.width <= viewport.width
          )
        })
        .toBe(true)
      // The actions are on screen without scrolling the page.
      const confirm = page.getByRole("button", { name: "Confirmar" })
      const confirmBox = await confirm.boundingBox()
      expect((confirmBox?.y ?? 9999) + (confirmBox?.height ?? 0)).toBeLessThanOrEqual(
        viewport.height,
      )
    })
  }

  test("numa tela baixa, o calendário rola dentro do popover", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 480 })
    await gotoStory(page, "forms-daterangepicker--default", "Selecione um período")
    await page.getByRole("button", { name: /Período/ }).click()
    const content = page.locator('[data-slot="popover-content"]')
    await expect
      .poll(async () => {
        const box = await content.boundingBox()
        return !!box && box.y >= 0 && box.y + box.height <= 480
      })
      .toBe(true)
    const confirm = page.getByRole("button", { name: "Confirmar" })
    await expect(confirm).toBeInViewport()
    const scroller = page.locator('[data-slot="date-range-picker-calendar"]')
    expect(await scroller.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true)
  })
})

test.describe("DateRangePicker: somente leitura", () => {
  test("fundo esmaecido, sem anel de hover, recebe foco e não abre", async ({ page }) => {
    await gotoStory(page, "forms-daterangepicker--default", "Selecione um período")
    const editableBg = await page
      .getByRole("button", { name: /Período/ })
      .evaluate((el) => getComputedStyle(el).backgroundColor)
    await gotoStory(page, "forms-daterangepicker--read-only", "15/01/2025")
    const trigger = page.getByRole("button", { name: /Período/ })
    expect(await trigger.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(
      editableBg,
    )
    await trigger.hover()
    await page.waitForTimeout(250)
    expect(await trigger.evaluate((el) => getComputedStyle(el).boxShadow)).toMatch(
      /^(none|rgba\(0, 0, 0, 0\) .*)$/,
    )
    await trigger.click()
    await expect(trigger).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("grid")).toHaveCount(0)
  })
})

test.describe("DateRangePicker: tamanhos", () => {
  test("sm, md e lg medem 32, 40 e 44 px", async ({ page }) => {
    await gotoStory(page, "forms-daterangepicker--sizes", "Tamanho lg")
    for (const [size, height] of Object.entries({ sm: 32, md: 40, lg: 44 })) {
      const box = await page
        .getByRole("button", { name: new RegExp(`Tamanho ${size}`) })
        .boundingBox()
      expect(box?.height, size).toBeCloseTo(height, 0)
    }
  })
})

test.describe("TimePicker: digitar", () => {
  test("9:30 vira 09:30 e sair do campo não apaga nada", async ({ page }) => {
    await gotoStory(page, "forms-timepicker--empty", "Valor: (vazio)")
    const hour = page.getByRole("textbox", { name: "Horas" })
    const minute = page.getByRole("textbox", { name: "Minutos" })
    await hour.click()
    await page.keyboard.type("9:30")
    await expect(hour).toHaveValue("09")
    await expect(minute).toHaveValue("30")
    await expect(page.getByText("Valor: 09:30")).toBeVisible()
    await page.keyboard.press("Tab")
    await expect(hour).toHaveValue("09")
    await expect(minute).toHaveValue("30")
    await expect(page.getByText("Valor: 09:30")).toBeVisible()
  })

  test("colar 14:30 preenche hora e minutos", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await gotoStory(page, "forms-timepicker--empty", "Valor: (vazio)")
    const hour = page.getByRole("textbox", { name: "Horas" })
    await hour.click()
    await page.evaluate(() => navigator.clipboard.writeText("Reunião às 14:30"))
    await page.keyboard.press("ControlOrMeta+V")
    await expect(hour).toHaveValue("14")
    await expect(page.getByRole("textbox", { name: "Minutos" })).toHaveValue("30")
    await expect(page.getByText("Valor: 14:30")).toBeVisible()
  })

  test("uma hora inválida é limpa ao sair, sem levar os minutos", async ({ page }) => {
    await gotoStory(page, "forms-timepicker--default", "Valor: 09:30")
    const hour = page.getByRole("textbox", { name: "Horas" })
    const minute = page.getByRole("textbox", { name: "Minutos" })
    await hour.click()
    await page.keyboard.type("3")
    await page.keyboard.press("Tab")
    await expect(hour).toHaveValue("03")
    await expect(page.getByText("Valor: 03:30")).toBeVisible()
    await hour.click()
    await page.keyboard.type("77")
    await minute.click()
    await page.keyboard.press("Tab")
    await expect(hour).toHaveValue("")
    await expect(minute).toHaveValue("30")
  })
})

test.describe("TimePicker: tamanhos", () => {
  test("sm, md e lg medem 32, 40 e 44 px, como os outros campos", async ({ page }) => {
    await gotoStory(page, "forms-timepicker--sizes", "Tamanho lg")
    for (const [size, height] of Object.entries({ sm: 32, md: 40, lg: 44 })) {
      const box = await page.getByRole("group", { name: `Tamanho ${size}` }).boundingBox()
      expect(box?.height, size).toBeCloseTo(height, 0)
    }
  })
})

test.describe("TimePicker: somente leitura", () => {
  test("fundo esmaecido, sem anel de hover, e as setas não mudam o horário", async ({ page }) => {
    await gotoStory(page, "forms-timepicker--empty", "Valor: (vazio)")
    const editableBg = await page
      .getByRole("group", { name: "Horário" })
      .evaluate((el) => getComputedStyle(el).backgroundColor)
    await gotoStory(page, "forms-timepicker--read-only", "Encerramento")
    const group = page.getByRole("group", { name: "Encerramento" })
    expect(await group.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(editableBg)
    await group.hover()
    await page.waitForTimeout(250)
    expect(await group.evaluate((el) => getComputedStyle(el).boxShadow)).toMatch(
      /^(none|rgba\(0, 0, 0, 0\) .*)$/,
    )
    const hour = page.getByRole("textbox", { name: "Horas" })
    await hour.click()
    await page.keyboard.press("ArrowUp")
    await page.keyboard.type("9")
    await expect(hour).toHaveValue("18")
  })
})

test.describe("Combobox: teclado no gatilho fechado", () => {
  test("seta para baixo abre; digitar abre com as letras na busca, sem perder nenhuma", async ({
    page,
  }) => {
    await gotoStory(page, "forms-combobox--default", "Selecione um status")
    const trigger = page.getByRole("combobox", { name: "Status" })
    await trigger.focus()
    await page.keyboard.press("ArrowDown")
    await expect(page.getByRole("listbox")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("listbox")).toHaveCount(0)
    await expect(trigger).toBeFocused()

    await page.keyboard.type("pen")
    const search = page.getByPlaceholder("Buscar...")
    await expect(search).toHaveValue("pen")
    await expect(page.getByRole("option")).toHaveText(["Pendente"])
    await page.keyboard.press("Enter")
    await expect(trigger).toHaveText(/Pendente/)
  })
})

test.describe("Combobox: alvo do × dos itens", () => {
  test("o × de um item responde num quadrado de 24 px em volta do ícone", async ({ page }) => {
    await gotoStory(page, "forms-combobox--multi-select", "2 selecionados")
    const remove = page.getByRole("button", { name: "Remover Advocacia" })
    const box = await remove.boundingBox()
    if (!box) throw new Error("no box")
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    for (const [dx, dy] of [
      [-11.5, -11.5],
      [11.5, -11.5],
      [-11.5, 11.5],
      [11.5, 11.5],
    ]) {
      const hit = await page.evaluate(
        ([x, y]) => document.elementFromPoint(x, y)?.closest("button")?.getAttribute("aria-label"),
        [cx + dx, cy + dy],
      )
      expect(hit, `${dx},${dy}`).toBe("Remover Advocacia")
    }
  })
})

test.describe("Combobox: cores forçadas", () => {
  test("a opção destacada pelo teclado continua visível em alto contraste", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" })
    await gotoStory(page, "forms-combobox--default", "Selecione um status")
    await page.getByRole("combobox", { name: "Status" }).click()
    const outline = (name: string) =>
      page.getByRole("option", { name }).evaluate((el) => getComputedStyle(el).outlineStyle)
    await expect(page.getByRole("option", { name: "Aprovado" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
    expect(await outline("Aprovado")).toBe("solid")
    expect(await outline("Pendente")).toBe("none")
    await page.keyboard.press("ArrowDown")
    await expect(page.getByRole("option", { name: "Pendente" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
    expect(await outline("Pendente")).toBe("solid")
    expect(await outline("Aprovado")).toBe("none")
  })
})

// iOS zooms the page in when a focused input has text under 16px.
test.describe("Ponteiro grosso (toque): texto de 16px nos campos de digitação", () => {
  test.use({ hasTouch: true, isMobile: true })

  test("busca do Combobox, DateInput e TimePicker usam 16px", async ({ page }) => {
    await gotoStory(page, "forms-dateinput--sizes", "Tamanho lg")
    expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true)
    await expect(page.getByRole("textbox", { name: "Tamanho md" })).toHaveCSS("font-size", "16px")
    const box = await page.getByRole("textbox", { name: "Tamanho md" }).boundingBox()
    expect(box?.height).toBeCloseTo(40, 0)

    await gotoStory(page, "forms-timepicker--sizes", "Tamanho lg")
    await expect(page.getByRole("textbox", { name: "Horas" }).first()).toHaveCSS(
      "font-size",
      "16px",
    )

    await gotoStory(page, "forms-combobox--default", "Selecione um status")
    await page.getByRole("combobox", { name: "Status" }).tap()
    await expect(page.getByPlaceholder("Buscar...")).toHaveCSS("font-size", "16px")
  })
})

test.describe("Ponteiro fino (mouse): texto de 14px nos campos de digitação", () => {
  test("busca do Combobox e DateInput continuam com 14px", async ({ page }) => {
    await gotoStory(page, "forms-dateinput--sizes", "Tamanho lg")
    await expect(page.getByRole("textbox", { name: "Tamanho md" })).toHaveCSS("font-size", "14px")
    await gotoStory(page, "forms-combobox--default", "Selecione um status")
    await page.getByRole("combobox", { name: "Status" }).click()
    await expect(page.getByPlaceholder("Buscar...")).toHaveCSS("font-size", "14px")
  })
})
