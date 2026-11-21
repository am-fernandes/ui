import type { Page } from "@playwright/test"
import { checkA11y, injectAxe } from "axe-playwright"

/** The rule set the Storybook test-runner enforces: WCAG 2.1 levels A and AA. */
export const WCAG_21_AA = {
  runOnly: { type: "tag" as const, values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
}

/**
 * Runs axe (WCAG 2.1 AA) on `context` (a selector, or axe's include/exclude
 * object) and fails on any violation.
 *
 * Storybook's a11y addon runs its own axe pass inside the preview after every
 * render, on the same `window.axe`. Two overlapping runs throw "Axe is already
 * running", so wait for the addon's pass to finish, and retry if a new one
 * starts in between (a re-render, a tooltip opening…).
 */
export async function expectNoA11yViolations(page: Page, context: Parameters<typeof checkA11y>[1]) {
  await injectAxe(page)
  for (let attempt = 0; ; attempt++) {
    await page.waitForFunction(
      () => !(window as unknown as { axe?: { _running?: boolean } }).axe?._running,
      null,
      { timeout: 15_000 },
    )
    try {
      await checkA11y(page, context, { axeOptions: WCAG_21_AA })
      return
    } catch (error) {
      if (attempt >= 3 || !String(error).includes("Axe is already running")) throw error
      await page.waitForTimeout(100)
    }
  }
}
