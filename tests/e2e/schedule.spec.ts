import { type Page, expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

// Storybook's dev server may still be compiling on the first hit.
async function gotoSchedule(page: Page, id: string) {
  await page.goto(story(id))
  await expect(page.locator('[data-slot="schedule"]')).toBeVisible({ timeout: 20_000 })
}

// Storybook's a11y addon also runs axe after each render, in the same page.
// Wait for it to be idle, and retry once if the two runs still collide.

const HOUR = 48 // default hourHeight

async function box(page: Page, selector: string) {
  const b = await page.locator(selector).first().boundingBox()
  if (!b) throw new Error(`no box for ${selector}`)
  return b
}

test.describe("Schedule — month", () => {
  test("a multi-day bar spans exactly its days", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--month")
    const bar = await page
      .getByRole("button", { name: /^Treinamento NR-35, dia inteiro/ })
      .boundingBox()
    const first = await box(page, '[data-slot="schedule-day"][data-date="2026-11-23"]')
    const last = await box(page, '[data-slot="schedule-day"][data-date="2026-11-25"]')
    // The bar sits inside the cells, with the 2px gutter on each side.
    expect(bar?.x).toBeGreaterThanOrEqual(first.x)
    expect(bar?.x).toBeLessThanOrEqual(first.x + 4)
    const barRight = (bar?.x ?? 0) + (bar?.width ?? 0)
    expect(barRight).toBeLessThanOrEqual(last.x + last.width)
    expect(barRight).toBeGreaterThanOrEqual(last.x + last.width - 4)
  })

  test("a timed event sits in its day cell", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--month")
    const chip = await page.getByRole("button", { name: /^Comitê de obras/ }).boundingBox()
    const cell = await box(page, '[data-slot="schedule-day"][data-date="2026-11-03"]')
    expect(chip?.x).toBeGreaterThanOrEqual(cell.x)
    expect((chip?.x ?? 0) + (chip?.width ?? 0)).toBeLessThanOrEqual(cell.x + cell.width)
    expect(chip?.y).toBeGreaterThan(cell.y)
    expect((chip?.y ?? 0) + (chip?.height ?? 0)).toBeLessThanOrEqual(cell.y + cell.height)
  })

  test("“+N mais” lists the whole day and Escape returns focus", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--month")
    const more = page.getByRole("button", { name: /^\+2 mais, quarta-feira, 18 de novembro/ })
    await more.click()
    const popover = page.getByRole("dialog", { name: "quarta-feira, 18 de novembro" })
    await expect(popover).toBeVisible()
    await expect(popover.getByRole("button")).toHaveCount(5)
    await page.keyboard.press("Escape")
    await expect(popover).toHaveCount(0)
    await expect(more).toBeFocused()
  })

  test("navigates months and back to today", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--month")
    await page.getByRole("button", { name: "Próximo mês" }).click()
    await expect(page.getByRole("heading", { name: "dezembro de 2026" })).toBeVisible()
    await page.getByRole("button", { name: "Mês anterior" }).click()
    await page.getByRole("button", { name: "Mês anterior" }).click()
    await expect(page.getByRole("heading", { name: "outubro de 2026" })).toBeVisible()
    await page.getByRole("button", { name: "Hoje" }).click()
    await expect(page.getByRole("heading", { name: "novembro de 2026" })).toBeVisible()
  })
})

test.describe("Schedule — week and day", () => {
  test("blocks sit at their hour; overlapping ones share the column side by side", async ({
    page,
  }) => {
    await gotoSchedule(page, "data-schedule--week")
    const grid = await box(page, '[data-slot="schedule-scroll"] > div')
    const column = await box(page, '[data-slot="schedule-day-column"][data-date="2026-11-18"]')
    const daily = await page.getByRole("button", { name: /^Daily de engenharia/ }).boundingBox()
    const review = await page.getByRole("button", { name: /^Revisão de proposta/ }).boundingBox()
    const lunch = await page.getByRole("button", { name: /^Almoço com fornecedor/ }).boundingBox()
    if (!daily || !review || !lunch) throw new Error("missing event")

    // 09:00 → 9h × 48px (+1px inset), 09:15 → 9.25h.
    expect(Math.round(daily.y - grid.y)).toBe(9 * HOUR + 1)
    expect(Math.round(review.y - grid.y)).toBe(9.25 * HOUR + 1)
    // 12:00–13:30 → 1.5h tall (−2px inset).
    expect(Math.round(lunch.height)).toBe(1.5 * HOUR - 2)

    // Daily and Revisão overlap: two half-width lanes inside Wednesday's column.
    expect(review.x).toBeGreaterThan(daily.x + daily.width - 1)
    for (const b of [daily, review]) {
      expect(b.x).toBeGreaterThanOrEqual(column.x)
      expect(b.x + b.width).toBeLessThanOrEqual(column.x + column.width)
      expect(b.width).toBeLessThan(column.width / 2)
    }
    // Lunch overlaps nothing: full column width.
    expect(lunch.width).toBeGreaterThan(column.width - 8)
  })

  test("starts scrolled to 08:00 and draws the time line at now (10:30)", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--week")
    const scroll = page.locator('[data-slot="schedule-scroll"]')
    expect(await scroll.evaluate((el) => el.scrollTop)).toBe(8 * HOUR - 8)
    await expect(scroll.getByText("08:00")).toBeInViewport()
    const grid = await box(page, '[data-slot="schedule-scroll"] > div')
    const line = await box(page, '[data-slot="schedule-now"]')
    expect(Math.round(line.y - grid.y)).toBe(10.5 * HOUR)
    const column = await box(page, '[data-slot="schedule-day-column"][data-date="2026-11-18"]')
    expect(line.x).toBeGreaterThanOrEqual(column.x - 1)
    expect(line.x + line.width).toBeLessThanOrEqual(column.x + column.width + 1)
  })

  test("header and body columns line up (scrollbar gutter reserved)", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--week")
    for (const date of ["2026-11-15", "2026-11-18", "2026-11-21"]) {
      const header = await box(page, `[data-slot="schedule-day-header"][data-date="${date}"]`)
      const column = await box(page, `[data-slot="schedule-day-column"][data-date="${date}"]`)
      expect(Math.abs(header.x - column.x)).toBeLessThanOrEqual(1)
      expect(Math.abs(header.width - column.width)).toBeLessThanOrEqual(1)
    }
  })

  test("all-day row spans multi-day bars across their columns", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--week")
    await page.getByRole("button", { name: "Próxima semana" }).click()
    const bar = await page.getByRole("button", { name: /^Treinamento NR-35/ }).boundingBox()
    const mon = await box(page, '[data-slot="schedule-day-header"][data-date="2026-11-23"]')
    const wed = await box(page, '[data-slot="schedule-day-header"][data-date="2026-11-25"]')
    expect(bar?.x).toBeGreaterThanOrEqual(mon.x)
    expect((bar?.x ?? 0) + (bar?.width ?? 0)).toBeLessThanOrEqual(wed.x + wed.width)
    expect((bar?.x ?? 0) + (bar?.width ?? 0)).toBeGreaterThan(wed.x + wed.width - 6)
  })

  test("an overnight shift stays in the time grid, drawn on both days", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--week")
    const blocks = page.locator('[data-slot="schedule-event"][data-event-id="concretagem"]')
    await expect(blocks).toHaveCount(2)
    expect(
      await blocks.evaluateAll((els) => els.map((el) => el.getAttribute("data-variant"))),
    ).toEqual(["block", "block"])
    const allDay = page.locator('[data-slot="schedule-all-day"]')
    await expect(allDay.getByRole("button", { name: /^Concretagem/ })).toHaveCount(0)
    const placed = await blocks.evaluateAll((els) =>
      els.map((el) => {
        const column = el.closest('[data-slot="schedule-day-column"]') as HTMLElement
        return {
          date: column.dataset.date,
          top: el.getBoundingClientRect().top - column.getBoundingClientRect().top,
        }
      }),
    )
    expect(placed.map((p) => p.date)).toEqual(["2026-11-19", "2026-11-20"])
    expect(placed[0]?.top).toBeCloseTo(22 * HOUR + 1, 0)
    expect(placed[1]?.top).toBeCloseTo(1, 0)
  })

  test("many events at once keep readable blocks and the rest goes to '+N'", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--many-at-once")
    const column = page.locator('[data-slot="schedule-day-column"][data-date="2026-11-19"]')
    const blocks = column.locator('[data-slot="schedule-event"]')
    await expect(blocks).toHaveCount(2)
    const columnWidth = (await column.boundingBox())?.width ?? 0
    for (const b of await blocks.all()) {
      const width = (await b.boundingBox())?.width ?? 0
      expect(width).toBeGreaterThanOrEqual(columnWidth / 3 - 5)
    }
    const more = column.getByRole("button", { name: /^\+5 mais/ })
    await expect(more).toBeVisible()
    expect((await more.boundingBox())?.height).toBeGreaterThanOrEqual(24)
    await more.click()
    const list = page.getByRole("dialog")
    await expect(list.getByRole("button", { name: /^Visita/ })).toHaveCount(5)
    await page.keyboard.press("Escape")
    await expect(more).toBeFocused()
  })

  test("a click on an empty slot gives its time, and the keyboard has a button per day", async ({
    page,
  }) => {
    await gotoSchedule(page, "data-schedule--new-event-on-slot")
    await expect(page.getByTestId("range")).toContainText("15/11/2026 até 22/11/2026")
    const column = page.locator('[data-slot="schedule-day-column"][data-date="2026-11-20"]')
    await column.scrollIntoViewIfNeeded()
    const grid = page.locator('[data-slot="schedule-scroll"]')
    await grid.evaluate((el) => {
      el.scrollTop = 13 * 48
    })
    const box = (await column.boundingBox())!
    // A point on the 14:00 line plus 10 minutes, at the right edge of the column.
    const y = box.y + 14 * HOUR + (10 / 60) * HOUR
    await page.mouse.click(box.x + box.width - 4, y)
    await expect(page.getByTestId("slot")).toContainText("14:00")
    await expect(page.getByTestId("slot")).toContainText("20 de novembro")

    const dayButton = page.getByRole("button", { name: "Novo evento em sábado, 21 de novembro" })
    await dayButton.focus()
    await page.keyboard.press("Enter")
    await expect(page.getByTestId("slot")).toContainText("21 de novembro")
    await expect(page.getByTestId("slot")).toContainText("08:00")

    await page.getByRole("button", { name: "Próxima semana" }).click()
    await expect(page.getByTestId("range")).toContainText("22/11/2026 até 29/11/2026")
  })

  test("switches views from the keyboard", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--week")
    await page.getByRole("radio", { name: "Semana" }).focus()
    await page.keyboard.press("ArrowRight")
    await expect(page.getByRole("radio", { name: "Dia" })).toBeChecked()
    await expect(page.getByRole("heading", { name: "quarta-feira, 18 de novembro" })).toBeVisible()
    await expect(page.locator('[data-slot="schedule-day-column"]')).toHaveCount(1)
    await page.keyboard.press("ArrowRight")
    await expect(page.getByRole("radio", { name: "Lista" })).toBeChecked()
    await expect(page.locator('[data-slot="schedule-list"]')).toBeVisible()
  })

  test("event details open in a popover", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--with-event-details")
    const event = page.getByRole("button", { name: /^Revisão de proposta/ })
    await event.click()
    const popover = page.getByRole("dialog", { name: "Revisão de proposta" })
    await expect(popover).toBeVisible()
    await expect(popover.getByText("Conferir planilha de custos")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(popover).toHaveCount(0)
    await expect(event).toBeFocused()
  })

  test("business hours: Monday first, grid from 07:00 to 19:00", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--business-hours")
    await expect(page.getByRole("heading", { name: "16 – 22 de nov. de 2026" })).toBeVisible()
    const grid = await box(page, '[data-slot="schedule-scroll"] > div')
    expect(grid.height).toBe(12 * HOUR)
    const visit = await page.getByRole("button", { name: /^Visita à obra/ }).boundingBox()
    expect(Math.round((visit?.y ?? 0) - grid.y)).toBe(2 * HOUR + 1)
  })
})

test.describe("Schedule — list and mobile", () => {
  test("list groups by day and marks today", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--list")
    const today = page.getByRole("heading", { name: /quarta-feira, 18 de novembro/ })
    await expect(today).toHaveAttribute("aria-current", "date")
    await expect(
      page.getByRole("region", { name: /quinta-feira, 19 de novembro/ }).getByText("22:00 – …"),
    ).toBeVisible()
  })

  test("empty list shows the empty state", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--empty-list")
    await expect(page.getByRole("heading", { name: "Nenhum evento neste período" })).toBeVisible()
  })

  test("at phone width nothing overflows the page in any view", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 740 })
    for (const id of ["month", "week", "day", "list"]) {
      await gotoSchedule(page, `data-schedule--${id}`)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow, id).toBeLessThanOrEqual(0)
      await expect(page.getByRole("button", { name: "Hoje" }), id).toBeInViewport()
      await expect(page.getByRole("radiogroup", { name: "Visualização" }), id).toBeInViewport()
    }
  })
})

test.describe("Schedule — keyboard", () => {
  test("the grid of hours is a named region that scrolls from the keyboard", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--week")
    const grid = page.getByRole("region", { name: "Grade de horários" })
    await grid.focus()
    const before = await grid.evaluate((el) => el.scrollTop)
    await page.keyboard.press("PageDown")
    await expect.poll(() => grid.evaluate((el) => el.scrollTop)).toBeGreaterThan(before)
  })
})

test.describe("Schedule — forced colours", () => {
  test("today and every event stay visible when colours are forced", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" })
    for (const id of ["month", "week"]) {
      await gotoSchedule(page, `data-schedule--${id}`)
      const today = page.locator('[aria-current="date"] .rounded-full').first()
      expect(await today.evaluate((el) => getComputedStyle(el).outlineStyle), id).toBe("solid")
      const looks = await page
        .locator('[data-slot="schedule-event"]:is([data-variant="bar"], [data-variant="block"])')
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).borderTopStyle))
      expect(looks.length, id).toBeGreaterThan(0)
      for (const style of looks) expect(style, id).toBe("solid")
    }
    await page.emulateMedia({ forcedColors: "none" })
  })
})

// The popover fades in; axe measuring contrast mid-fade sees faded text.
async function settled(page: Page) {
  await page
    .locator('[data-slot="popover-content"]')
    .evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)))
}

test.describe("Schedule — accessibility", () => {
  for (const id of ["month", "week", "day", "list"]) {
    test(`${id}: every event is a 24px target and no text is under 12px`, async ({ page }) => {
      await gotoSchedule(page, `data-schedule--${id}`)
      const targets = await page
        .locator('[data-slot="schedule-event"], [data-slot="schedule-more"]')
        .evaluateAll((els) =>
          els.map((el) => ({
            name: el.getAttribute("aria-label") ?? el.textContent ?? "",
            height: el.getBoundingClientRect().height,
          })),
        )
      expect(targets.length).toBeGreaterThan(0)
      for (const t of targets) expect(t.height, t.name).toBeGreaterThanOrEqual(24)

      const small = await page.locator('[data-slot="schedule"]').evaluate((root) => {
        const out: string[] = []
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
        while (walker.nextNode()) {
          const el = walker.currentNode.parentElement
          const text = walker.currentNode.nodeValue?.trim()
          if (!el || !text || el.closest(".sr-only")) continue
          if (Number.parseFloat(getComputedStyle(el).fontSize) < 12) out.push(text)
        }
        return out
      })
      expect(small).toEqual([])
    })
  }

  for (const id of ["month", "week", "day", "list", "empty-list", "loading"]) {
    test(`${id} has no WCAG 2.1 AA violations`, async ({ page }) => {
      await gotoSchedule(page, `data-schedule--${id}`)
      await expectNoA11yViolations(page, '[data-slot="schedule"]')
    })
  }

  test("open popovers have no WCAG 2.1 AA violations", async ({ page }) => {
    await gotoSchedule(page, "data-schedule--month")
    await page.getByRole("button", { name: /^\+2 mais, quarta-feira/ }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await settled(page)
    await expectNoA11yViolations(page, '[data-slot="popover-content"]')

    await gotoSchedule(page, "data-schedule--with-event-details")
    await page.getByRole("button", { name: /^Revisão de proposta/ }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await settled(page)
    await expectNoA11yViolations(page, '[data-slot="popover-content"]')
  })
})
