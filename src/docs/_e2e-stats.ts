/**
 * AUTO-GENERATED — do not edit by hand.
 * Run `bun run sync:e2e-stats` to refresh.
 *
 * Source: tests/e2e/*.spec.ts + src story files
 * Generated: 2026-05-19T02:00:23.915Z
 */

export interface E2ESpec {
  file: string
  tests: number
  describes: number
}

export const E2E_GENERATED_AT = "2026-05-19T02:00:23.915Z"

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
    file: "mobile.spec.ts",
    tests: 6,
    describes: 4,
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
  {
    file: "responsive.spec.ts",
    tests: 7,
    describes: 1,
  },
  {
    file: "tablet.spec.ts",
    tests: 3,
    describes: 3,
  },
  {
    file: "visual.spec.ts",
    tests: 57,
    describes: 20,
  },
] as const

export const E2E_TOTAL_TESTS = 102

export const STORYBOOK_STATS = {
  totalStoryFiles: 40,
  playFunctionFiles: 19,
  playFunctionsTotal: 21,
} as const
