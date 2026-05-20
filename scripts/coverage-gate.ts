/**
 * Coverage gate — fails CI when the line/statement/function coverage drops
 * below the configured threshold. Branches are reported but not gated
 * (volatile metric across small refactors).
 *
 * Reads `coverage/coverage-summary.json` produced by `bun run test:coverage`.
 *
 * Local usage:
 *   bun run test:coverage && bun scripts/coverage-gate.ts
 */

import { readFileSync } from "node:fs"

const THRESHOLD = 95
const SUMMARY_PATH = "./coverage/coverage-summary.json"

interface CoverageMetric {
  total: number
  covered: number
  skipped: number
  pct: number
}

interface CoverageTotals {
  lines: CoverageMetric
  statements: CoverageMetric
  functions: CoverageMetric
  branches: CoverageMetric
}

const summary = JSON.parse(readFileSync(SUMMARY_PATH, "utf8")) as {
  total: CoverageTotals
}
const totals = summary.total

const gated = ["lines", "statements", "functions"] as const
const failing = gated.filter((k) => totals[k].pct < THRESHOLD)

if (failing.length > 0) {
  console.error(`::error::Coverage below ${THRESHOLD}% threshold:`)
  for (const k of failing) {
    console.error(`::error::  ${k}: ${totals[k].pct.toFixed(2)}%`)
  }
  console.error("")
  console.error("Full totals:")
  for (const k of [...gated, "branches"] as const) {
    console.error(`  ${k}: ${totals[k].pct.toFixed(2)}%`)
  }
  process.exit(1)
}

console.log(`Coverage OK (>= ${THRESHOLD}% threshold):`)
for (const k of [...gated, "branches"] as const) {
  console.log(`  ${k}: ${totals[k].pct.toFixed(2)}%`)
}
