import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

/**
 * Contract of the states drawn with a layer (`state-hover`, `state-pressed`):
 * the layer is a `background-image`, and forced colours (Windows High
 * Contrast) drop background images. A state that is not the pointer (the
 * active item of a list, the highlighted row of a menu, a focused row with no
 * ring) needs its own look there, or the user moves with the arrows and
 * does not see where they are.
 *
 * The CommandPalette's active item and the rows of the AppShell's rail
 * flyout had only the layer. A pointer hover can go without it (the pointer
 * shows where it is).
 */

const root = path.join(__dirname, "..", "..")

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name)
    if (statSync(file).isDirectory()) return name === "docs" ? [] : sourceFiles(file)
    return /\.tsx?$/.test(name) && !/\.(test|stories)\.tsx?$/.test(name) ? [file] : []
  })
}

/**
 * The pointer shows where it is: a hover or a press can go without a look of
 * its own. A row lit because a button inside it has the focus (`has-[…]`)
 * shows that button's ring.
 */
const exempt = (chain: string) => /hover|active/.test(chain) || chain.startsWith("has-[")

/** A focused menu row is Radix's highlighted one, and the other way round. */
const SAME_STATE: Record<string, string[]> = {
  focus: ["focus", "data-highlighted", "focus-visible"],
  "data-highlighted": ["data-highlighted", "focus"],
  "data-[highlighted]": ["data-[highlighted]", "data-highlighted", "focus"],
}

/** The last variant of a chain (`in-data-[x]:focus` → `focus`), brackets kept whole. */
function lastVariant(chain: string): string {
  let depth = 0
  let start = 0
  for (let i = 0; i < chain.length; i++) {
    const char = chain[i]
    if (char === "[") depth++
    else if (char === "]") depth--
    else if (char === ":" && depth === 0) start = i + 1
  }
  return chain.slice(start)
}

describe("states drawn with a layer, in forced colours", () => {
  it("every non-pointer state with a layer has a forced-colors look for that state", () => {
    const missing: string[] = []
    for (const file of sourceFiles(path.join(root, "src"))) {
      const text = readFileSync(file, "utf8")
      for (const match of text.matchAll(/(?<=[\s"'`])([^\s"'`]+):state-(?:hover|pressed)\b/g)) {
        const chain = match[1] ?? ""
        if (exempt(chain)) continue
        const state = lastVariant(chain)
        const states = SAME_STATE[state] ?? [state]
        if (!states.some((s) => text.includes(`forced-colors:${s}:`))) {
          const line = text.slice(0, match.index).split("\n").length
          missing.push(`${path.relative(root, file)}:${line}  ${chain}:state-*`)
        }
      }
    }
    expect(missing).toEqual([])
  })
})
