import { expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

async function gotoTree(page: import("@playwright/test").Page, id: string) {
  await page.goto(story(id))
  await expect(page.getByRole("tree")).toBeVisible({ timeout: 15_000 })
}

const label = (page: import("@playwright/test").Page) =>
  page.evaluate(
    () => document.activeElement?.querySelector('[data-slot="tree-label"]')?.textContent ?? "",
  )

test.describe("Tree", () => {
  test("the arrow keys reach every visible item, nested files included", async ({ page }) => {
    await gotoTree(page, "data-tree--default")
    await page.getByRole("treeitem").first().focus()
    const seen = [await label(page)]
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("ArrowDown")
      seen.push(await label(page))
    }
    expect(seen).toEqual([
      "src",
      "components",
      "button.tsx",
      "input.tsx",
      "index.ts",
      "config",
      "README.md",
    ])
  })

  test("the focus ring is drawn on the row, not around the whole branch", async ({ page }) => {
    await gotoTree(page, "data-tree--default")
    await page.getByRole("treeitem").first().focus()
    await page.keyboard.press("ArrowDown") // "components", which has children
    const row = page.locator('[role="treeitem"]:focus > [data-slot="tree-row"]')
    const look = await row.evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        style: cs.outlineStyle,
        width: cs.outlineWidth,
        height: el.getBoundingClientRect().height,
      }
    })
    expect(look.style).toBe("solid")
    expect(look.width).toBe("2px")
    expect(look.height).toBeLessThan(40)
    const item = page.locator('[role="treeitem"]:focus')
    expect(await item.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("none")
  })

  test("the chevron opens a folder without moving the selection", async ({ page }) => {
    await gotoTree(page, "data-tree--controlled")
    const selected = page.getByRole("treeitem", { selected: true })
    await expect(selected).toHaveCount(0)
    // A treeitem is named by its own label only, not by its children.
    const config = page.getByRole("treeitem", { name: "config", exact: true })
    await config.locator('[data-slot="tree-toggle"]').first().click()
    await expect(page.getByText("tsconfig.json")).toBeVisible()
    await expect(config).toHaveAttribute("aria-selected", "false")
  })

  test("a lazy node shows a loading row and then its children", async ({ page }) => {
    await gotoTree(page, "data-tree--lazy-children")
    await page.getByText("Residencial Aurora").click()
    await expect(page.getByText("Carregando…")).toBeVisible()
    await expect(page.getByText("Bloco A")).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText("Carregando…")).toHaveCount(0)
  })

  test("in forced colours the selected row is still told apart", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" })
    await gotoTree(page, "data-tree--default")
    await page.getByText("index.ts").click()
    const rowOf = (name: string) =>
      page.getByRole("treeitem", { name }).locator(':scope > [data-slot="tree-row"]')
    const outline = (el: Element) => {
      const cs = getComputedStyle(el)
      return `${cs.outlineStyle} ${cs.outlineColor}`
    }
    await expect.poll(() => rowOf("index.ts").evaluate(outline)).toContain("solid")
    expect(await rowOf("README.md").evaluate(outline)).toContain("none")
    await page.emulateMedia({ forcedColors: "none" })
  })

  test("has no WCAG 2.1 AA violations", async ({ page }) => {
    await gotoTree(page, "data-tree--default")
    await expectNoA11yViolations(page, '[data-slot="tree"]')
  })
})
