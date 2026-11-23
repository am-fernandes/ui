import { expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

/**
 * The controls of each row of the story, by the `data-slot` of the element
 * that is the whole box (border included), and how many of each a row has.
 */
const CONTROLS = [
  { slot: "button", count: 6 },
  { slot: "icon-button", count: 2, square: true },
  { slot: "toggle", count: 2 },
]

const HEIGHTS = { sm: 32, md: 40, lg: 44 } as const

test.describe("Control size", () => {
  for (const [size, height] of Object.entries(HEIGHTS)) {
    test(`every ${size} control is ${height}px tall and shares one centre line`, async ({
      page,
    }) => {
      await page.goto(story("primitives-control-size--alignment"))
      const row = page.getByTestId(`row-${size}`)
      await expect(row).toBeVisible({ timeout: 15_000 })

      const centres: number[] = []
      for (const control of CONTROLS) {
        const boxes = await row.locator(`[data-slot="${control.slot}"]`).evaluateAll((elements) =>
          elements.map((element) => {
            const rect = element.getBoundingClientRect()
            const label = element.getAttribute("aria-label") ?? element.textContent ?? ""
            return {
              name: `${element.getAttribute("data-slot")} "${label.trim()}"`,
              width: rect.width,
              height: rect.height,
              centre: rect.top + rect.height / 2,
            }
          }),
        )
        expect(boxes, `${control.slot} in the ${size} row`).toHaveLength(control.count)
        for (const box of boxes) {
          expect(box.height, `height of ${box.name}`).toBe(height)
          if (control.square) expect(box.width, `width of ${box.name}`).toBe(height)
          centres.push(box.centre)
        }
      }

      // One line: every box is centred on the same y.
      expect(new Set(centres).size, `centres: ${centres.join(", ")}`).toBe(1)
    })
  }
})
