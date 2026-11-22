/**
 * Decide quais arquivos do build precisam da diretiva "use client".
 *
 * O esbuild descarta a diretiva ao empacotar com splitting, e o pacote
 * publicado saía sem nenhuma: num app com React Server Components (Next.js
 * App Router), importar um componente da lib dentro de um Server Component
 * quebrava. A regra aqui é simples: um arquivo de saída é de cliente quando
 * algum módulo de origem dentro dele declara "use client".
 *
 * Um módulo público sem a diretiva (helpers de `src/lib`, `Breadcrumb`,
 * `Badge`...) deve continuar utilizável no servidor. Se ele cair no mesmo
 * arquivo de saída que um módulo de cliente, o build falha em vez de
 * transformá-lo em cliente sem aviso.
 */

export interface Metafile {
  outputs: Record<
    string,
    {
      inputs: Record<string, unknown>
      entryPoint?: string
    }
  >
}

export interface UseClientPlan {
  /** Saídas que recebem a diretiva. */
  client: string[]
  /** Saídas que misturam um módulo público de servidor com um de cliente. */
  conflicts: { output: string; serverEntries: string[]; clientInputs: string[] }[]
}

export const DIRECTIVE = '"use client";\n'

export function hasUseClient(source: string): boolean {
  // Comentários e linhas em branco podem vir antes da diretiva.
  const stripped = source.replace(/^(?:\s+|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*/, "")
  return /^(["'])use client\1/.test(stripped)
}

export function planUseClient(
  metafile: Metafile,
  isClientSource: (path: string) => boolean,
): UseClientPlan {
  const entryPoints = new Set<string>()
  for (const output of Object.values(metafile.outputs)) {
    if (output.entryPoint) entryPoints.add(output.entryPoint)
  }

  const plan: UseClientPlan = { client: [], conflicts: [] }
  for (const [path, output] of Object.entries(metafile.outputs)) {
    if (!path.endsWith(".js")) continue
    const sources = Object.keys(output.inputs).filter((input) => !input.includes("node_modules"))
    const clientInputs = sources.filter(isClientSource)
    if (clientInputs.length === 0) continue
    plan.client.push(path)
    const serverEntries = sources.filter(
      (input) => !isClientSource(input) && entryPoints.has(input),
    )
    if (serverEntries.length > 0) {
      plan.conflicts.push({ output: path, serverEntries, clientInputs })
    }
  }
  plan.client.sort()
  return plan
}
