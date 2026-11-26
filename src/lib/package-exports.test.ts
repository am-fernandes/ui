import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// Regressão: `date.ts` e `format.ts` são compilados para `dist/lib/`, mas não
// tinham entrada em `exports`, então `@amfernandesinc/ui/lib/date` não
// resolvia. Todo helper público de `src/lib` precisa do seu subpath.
const root = join(__dirname, "..", "..")
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  exports: Record<string, unknown>
}

const helpers = readdirSync(join(root, "src", "lib"))
  .filter((file) => /^[a-z][\w-]*\.ts$/.test(file) && !file.includes(".test."))
  .map((file) => file.replace(/\.ts$/, ""))

describe("package.json: subpaths dos helpers", () => {
  it("encontra os helpers", () => {
    expect(helpers).toEqual(expect.arrayContaining(["brazil", "date", "format"]))
  })

  it.each(helpers)("./lib/%s aponta para o arquivo compilado", (name) => {
    expect(pkg.exports[`./lib/${name}`]).toEqual({
      types: `./dist/lib/${name}.d.ts`,
      import: `./dist/lib/${name}.js`,
    })
  })
})
