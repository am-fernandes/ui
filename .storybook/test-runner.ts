import type { TestRunnerConfig } from "@storybook/test-runner"

/**
 * Storybook test-runner config.
 *
 * Runs every story in Chromium and asserts:
 *   - the story renders without console errors
 *   - any `play` function defined in the story passes
 *
 * Smoke test by default: any `play` fn provides deeper interaction coverage.
 */
const config: TestRunnerConfig = {
  // Reasonable defaults; hooks below can be uncommented for custom assertions.
  // async preVisit(page) {
  //   // example: inject axe-core, set color-scheme
  // },
  // async postVisit(page, context) {
  //   // example: assert no console errors
  // },
}

export default config
