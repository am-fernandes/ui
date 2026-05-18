/**
 * AUTO-GENERATED — do not edit by hand.
 * Run `bun run sync:e2e-stats` to refresh.
 *
 * Source: tests/e2e/*.spec.ts + src story files
 * Generated: 2026-05-18T22:25:10.644Z
 */

export interface E2ESpec {
  file: string
  tests: number
  describes: number
}

export const E2E_GENERATED_AT = "2026-05-18T22:25:10.644Z"

export const E2E_SPECS: readonly E2ESpec[] = [
  {
    file: "domain.spec.ts",
    tests: 5,
    describes: 4,
  },
  {
    file: "forms.spec.ts",
    tests: 5,
    describes: 3,
  },
  {
    file: "navigation.spec.ts",
    tests: 5,
    describes: 3,
  },
  {
    file: "overlays.spec.ts",
    tests: 5,
    describes: 3,
  },
  {
    file: "primitives.spec.ts",
    tests: 9,
    describes: 3,
  },
] as const

export const E2E_TOTAL_TESTS = 29

export const STORYBOOK_STATS = {
  totalStoryFiles: 41,
  playFunctionFiles: 3,
  playFunctionsTotal: 5,
} as const
