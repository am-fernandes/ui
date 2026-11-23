import { expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

/** The whole box of each control, border included. */
const CONTROL_BOXES = ['[data-slot="button"]'].join(", ")

const HEIGHTS = { sm: 32, md: 40, lg: 44 } as const

test.describe("Control size", () => {
  for (const [size, height] of Object.entries(HEIGHTS)) {
    test(`every ${size} control is ${height}px tall and shares one centre line`, async ({
      page,
    }) => {
      await page.goto(story("primitives-control-size--alignment"))
      const row = page.getByTestId(`row-${size}`)
      await expect(row).toBeVisible({ timeout: 15_000 })

      const boxes = await row.locator(CONTROL_BOXES).evaluateAll((elements) =>
        elements.map((element) => {
          const rect = element.getBoundingClientRect()
          return {
            name: `${element.getAttribute("data-slot")} "${(
              element.getAttribute("aria-label") ?? element.textContent ?? ""
            ).trim()}"`,
            height: rect.height,
            centre: rect.top + rect.height / 2,
          }
        }),
      )

      // One box per control of the row: nothing wrapped to a second line.
      expect(boxes.length).toBeGreaterThanOrEqual(6)
      for (const box of boxes) {
        expect(box.height, `height of ${box.name}`).toBe(height)
        expect(box.centre, `centre of ${box.name}`).toBe(boxes[0]?.centre)
      }
    })
  }
})
