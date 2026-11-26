import { type TestRunnerConfig, getStoryContext } from "@storybook/test-runner"
import { checkA11y, configureAxe, injectAxe } from "axe-playwright"

/**
 * Storybook test-runner config.
 *
 * Runs every story in Chromium and asserts:
 *   - the story renders without console errors
 *   - any `play` function defined in the story passes
 *   - axe-core has zero WCAG 2.1 AA violations (severity serious/critical),
 *     in the light theme and again in the dark one
 *
 * Each story runs axe twice, so the scripts raise the per-story timeout to
 * 30s (`--testTimeout`): an autoplaying video alone takes ~10s per pass.
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

    const axeOptions = {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: {
          type: "tag" as const,
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
        },
        rules: ruleOverrides,
      },
    }

    await checkA11y(page, "body", axeOptions)

    // Same story in the dark theme: the tokens flip under `.dark`, so every
    // text/background pair is measured again.
    // Transitions are switched off first, or axe would measure colors halfway
    // through the light-to-dark fade.
    await page.evaluate(() => {
      const style = document.createElement("style")
      style.id = "a11y-dark-pass"
      style.textContent = "*,*::before,*::after{transition:none!important}"
      document.head.append(style)
      document.documentElement.classList.add("dark")
    })
    try {
      await checkA11y(page, "body", axeOptions)
    } finally {
      await page.evaluate(() => {
        document.documentElement.classList.remove("dark")
        document.getElementById("a11y-dark-pass")?.remove()
      })
    }
  },
}

export default config
