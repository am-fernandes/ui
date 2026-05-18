import { expect, test } from "@playwright/test"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

test.describe("Tabs", () => {
  test("clicking trigger switches content", async ({ page }) => {
    await page.goto(story("navigation-tabs--default"))
    const tabs = page.getByRole("tab")
    const count = await tabs.count()
    expect(count).toBeGreaterThan(1)
    await tabs.nth(1).click()
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true")
  })

  test("keyboard arrow navigates between tabs", async ({ page }) => {
    await page.goto(story("navigation-tabs--default"))
    const first = page.getByRole("tab").first()
    await first.focus()
    await page.keyboard.press("ArrowRight")
    const second = page.getByRole("tab").nth(1)
    await expect(second).toBeFocused()
  })
})

test.describe("Accordion", () => {
  test("clicking trigger expands content", async ({ page }) => {
    await page.goto(story("navigation-accordion--single"))
    const trigger = page.getByRole("button").first()
    await trigger.click()
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
  })

  test("clicking expanded trigger collapses it (collapsible=true)", async ({ page }) => {
    await page.goto(story("navigation-accordion--single"))
    const trigger = page.getByRole("button").first()
    await trigger.click()
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
    await trigger.click()
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
  })
})

test.describe("Breadcrumb", () => {
  test("last item is marked as current page", async ({ page }) => {
    await page.goto(story("navigation-breadcrumb--default"))
    const current = page.locator('[aria-current="page"]')
    await expect(current).toHaveCount(1)
  })
})
