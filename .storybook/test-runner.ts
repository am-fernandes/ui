import { type TestRunnerConfig, getStoryContext } from "@storybook/test-runner"
import { checkA11y, configureAxe, injectAxe } from "axe-playwright"

/**
 * Storybook test-runner config.
 *
 * Runs every story in Chromium and asserts:
 *   - the story renders without console errors
 *   - any `play` function defined in the story passes
 *   - axe-core has zero WCAG 2.1 AA violations (severity serious/critical)
 *
 * Stories may opt-out per-story via `parameters.a11y.disable: true` or tune
 * the rule set via `parameters.a11y.config.rules`.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page)
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context)

    if (storyContext.parameters?.a11y?.disable) return

    await configureAxe(page, {
      rules: storyContext.parameters?.a11y?.config?.rules ?? [],
    })

    await checkA11y(page, "#storybook-root", {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
        },
      },
    })
  },
}

export default config
