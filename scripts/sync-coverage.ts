#!/usr/bin/env bun
/**
 * Reads coverage/coverage-summary.json (produced by `bun run test:coverage`)
 * and writes a typed TypeScript module to src/docs/_coverage.ts.
 *
 * The Quality.mdx page imports from that module to render live coverage
 * tables. Run this script after every coverage run.
 *
 * Wired into `bun run sync:coverage`.
 */

import { writeFile } from "node:fs/promises"
import path from "node:path"
import { $ } from "bun"

interface MetricBucket {
  total: number
  covered: number
  skipped: number
  pct: number
}

interface FileSummary {
  lines: MetricBucket
  statements: MetricBucket
  functions: MetricBucket
  branches: MetricBucket
}

interface CoverageSummaryJson {
  total: FileSummary
  [filePath: string]: FileSummary
}

const ROOT = path.resolve(import.meta.dir, "..")
const SRC = path.join(ROOT, "src")
const SUMMARY_PATH = path.join(ROOT, "coverage", "coverage-summary.json")
const OUT_PATH = path.join(ROOT, "src", "docs", "_coverage.ts")

const summary = (await Bun.file(SUMMARY_PATH).json()) as CoverageSummaryJson

interface ComponentRow {
  file: string
  group: string
  lines: number
  statements: number
  functions: number
  branches: number
}

const GROUP_BY_DIR: Record<string, string> = {
  primitives: "Primitives",
  overlays: "Overlays",
  forms: "Forms",
  navigation: "Navigation",
  data: "Data",
  domain: "Domain",
  hooks: "Hooks",
  lib: "Lib",
}

const rows: ComponentRow[] = []
for (const [absPath, file] of Object.entries(summary)) {
  if (absPath === "total") continue
  // Resolve to repo-relative path
  const rel = path.relative(SRC, absPath)
  // Skip _internal helpers from the headline table (still included in totals)
  if (rel.includes("_internal")) continue
  const parts = rel.split(path.sep)
  const dir = parts[0] ?? ""
  const group = GROUP_BY_DIR[dir] ?? dir
  rows.push({
    file: rel,
    group,
    lines: file.lines.pct,
    statements: file.statements.pct,
    functions: file.functions.pct,
    branches: file.branches.pct,
  })
}

rows.sort((a, b) => {
  if (a.group !== b.group) return a.group.localeCompare(b.group)
  return a.file.localeCompare(b.file)
})

const generatedAt = new Date().toISOString()

const out = `/**
 * AUTO-GENERATED — do not edit by hand.
 * Run \`bun run sync:coverage\` to refresh.
 *
 * Source: coverage/coverage-summary.json (vitest + v8 provider)
 * Generated: ${generatedAt}
 */

export interface CoverageMetric {
  total: number
  covered: number
  pct: number
}

export interface CoverageFile {
  lines: CoverageMetric
  statements: CoverageMetric
  functions: CoverageMetric
  branches: CoverageMetric
}

export interface CoverageRow {
  file: string
  group: string
  lines: number
  statements: number
  functions: number
  branches: number
}

export const COVERAGE_GENERATED_AT = "${generatedAt}"

export const TOTAL_COVERAGE: CoverageFile = ${JSON.stringify(
  {
    lines: {
      total: summary.total.lines.total,
      covered: summary.total.lines.covered,
      pct: summary.total.lines.pct,
    },
    statements: {
      total: summary.total.statements.total,
      covered: summary.total.statements.covered,
      pct: summary.total.statements.pct,
    },
    functions: {
      total: summary.total.functions.total,
      covered: summary.total.functions.covered,
      pct: summary.total.functions.pct,
    },
    branches: {
      total: summary.total.branches.total,
      covered: summary.total.branches.covered,
      pct: summary.total.branches.pct,
    },
  },
  null,
  2,
)} as const

export const COVERAGE_ROWS: readonly CoverageRow[] = ${JSON.stringify(rows, null, 2)} as const
`

await writeFile(OUT_PATH, out, "utf8")
// Format the generated file so it conforms to biome's style rules (no
// trailing commas inside JSON.stringify output, double-quoted keys, etc).
await $`bunx biome format --write ${OUT_PATH}`.quiet()
console.log(`✓ wrote ${path.relative(ROOT, OUT_PATH)} with ${rows.length} files`)
console.log(
  `  total lines=${summary.total.lines.pct}%, branches=${summary.total.branches.pct}%, functions=${summary.total.functions.pct}%`,
)
