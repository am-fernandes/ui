/**
 * Passo do build: recoloca "use client" nos arquivos de `dist` que contêm
 * código de cliente, e confere o resultado. Roda depois do tsup, que grava
 * `dist/metafile-esm.json` (`metafile: true` em tsup.config.ts).
 *
 *   bun scripts/use-client.ts
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { DIRECTIVE, type Metafile, hasUseClient, planUseClient } from "./lib/use-client"

const root = join(import.meta.dir, "..")
const metafilePath = join(root, "dist", "metafile-esm.json")

if (!existsSync(metafilePath)) {
  console.error("use-client: dist/metafile-esm.json não existe. Rode o tsup antes (bun run build).")
  process.exit(1)
}

const metafile = JSON.parse(readFileSync(metafilePath, "utf8")) as Metafile
const cache = new Map<string, boolean>()
const isClientSource = (path: string): boolean => {
  const known = cache.get(path)
  if (known !== undefined) return known
  const file = join(root, path)
  const result = existsSync(file) && hasUseClient(readFileSync(file, "utf8"))
  cache.set(path, result)
  return result
}

const plan = planUseClient(metafile, isClientSource)

if (plan.conflicts.length > 0) {
  console.error("use-client: módulo público de servidor empacotado junto com código de cliente:")
  for (const conflict of plan.conflicts) {
    console.error(
      `  ${conflict.output}\n    servidor: ${conflict.serverEntries.join(", ")}\n    cliente:  ${conflict.clientInputs.join(", ")}`,
    )
  }
  console.error(
    'Marcar esse arquivo com "use client" tornaria o módulo de servidor inutilizável num Server Component. Tire a dependência entre os dois ou declare "use client" no módulo público.',
  )
  process.exit(1)
}

for (const output of plan.client) {
  const file = join(root, output)
  const code = readFileSync(file, "utf8")
  if (!hasUseClient(code)) writeFileSync(file, DIRECTIVE + code)
}

// Conferência: toda saída de cliente começa com a diretiva, e nenhuma outra.
const clientOutputs = new Set(plan.client)
const wrong: string[] = []
for (const output of Object.keys(metafile.outputs)) {
  if (!output.endsWith(".js")) continue
  const marked = hasUseClient(readFileSync(join(root, output), "utf8"))
  if (marked !== clientOutputs.has(output)) wrong.push(output)
}
if (wrong.length > 0) {
  console.error(`use-client: diretiva errada em ${wrong.join(", ")}`)
  process.exit(1)
}

// O metafile só serve a este passo; não vai para o pacote.
rmSync(metafilePath)
console.log(
  `use-client: ${plan.client.length} arquivos de cliente marcados de ${Object.keys(metafile.outputs).filter((o) => o.endsWith(".js")).length}.`,
)
