import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

// vitest runs from the repository root.
const root = process.cwd()
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as {
  exports: Record<string, unknown>
}
const barrel = readFileSync(path.join(root, "src/index.ts"), "utf8")

/** Every component file of the family: `button.tsx` gives `button`. */
const components = readdirSync(path.join(root, "src/primitives"))
  .filter((file) => file.endsWith(".tsx") && !/\.(test|stories)\.tsx$/.test(file))
  .map((file) => file.replace(/\.tsx$/, ""))

describe("primitives: package.json exports", () => {
  it("finds the components of the family", () => {
    expect(components).toEqual(expect.arrayContaining(["button", "toggle", "input"]))
  })

  // A component in the barrel with no subpath cannot be imported the way the
  // README teaches (`@amfernandesinc/ui/toggle`).
  it.each(components)("has the ./%s subpath", (name) => {
    expect(pkg.exports[`./${name}`]).toEqual({
      types: `./dist/primitives/${name}.d.ts`,
      import: `./dist/primitives/${name}.js`,
    })
  })

  it.each(components)("exports %s from the barrel", (name) => {
    expect(barrel).toContain(`"./primitives/${name}"`)
  })
})
