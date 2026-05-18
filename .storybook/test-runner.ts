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

    const storyRules = storyContext.parameters?.a11y?.config?.rules ?? []

    // Pass story-level rule overrides to axe-core via configure (registers the rule id),
    // and ALSO map them into the run-time `rules` option which is what actually disables
    // a rule during evaluation. The `configure` call alone is not enough.
    await configureAxe(page, { rules: storyRules })

    const ruleOverrides = storyRules.reduce<Record<string, { enabled: boolean }>>((acc, rule) => {
      if (rule?.id) acc[rule.id] = { enabled: rule.enabled !== false }
      return acc
    }, {})

    await checkA11y(page, "#storybook-root", {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
        },
        rules: ruleOverrides,
      },
    })
  },
}

export default config
