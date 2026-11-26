/**
 * Regenera a referência de API da skill a partir de src/:
 *
 *   bun run skill:api
 *
 * Rode depois de mudar props, JSDoc, `labels` ou exports. O teste
 * scripts/lib/skill-api.test.ts falha enquanto os arquivos estiverem velhos.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { createProgram, generateApi, subpathsBySource } from "./lib/skill-api"

export const API_DIR = "skills/designing-with-amfernandesinc-ui/reference/api"

const root = join(import.meta.dir, "..")
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
const { files, entries } = generateApi(createProgram(root), root, subpathsBySource(pkg.exports))
const dir = join(root, API_DIR)
mkdirSync(dir, { recursive: true })
for (const [name, content] of files) writeFileSync(join(dir, name), content)
console.log(`skill:api: ${entries.length} exports em ${files.size} arquivos (${API_DIR})`)
