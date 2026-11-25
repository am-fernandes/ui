/**
 * Compila os exemplos da skill contra o código da lib: cada bloco ```tsx ou
 * ```ts dos guias vira um módulo, com `@amfernandesinc/ui` (e cada subpath)
 * apontando para src/. Um exemplo que não compila é um exemplo errado.
 *
 * Ficam de fora só os blocos que começam com `// ❌` (o jeito errado, de
 * propósito) ou com `// fora da verificação: <motivo>` (dependem de um pacote
 * do app que este repositório não tem, como `next` ou `react-router`).
 */
import path from "node:path"
import ts from "typescript"

export interface ExampleBlock {
  file: string
  /** Line of the opening fence, 1-based. */
  line: number
  lang: "ts" | "tsx"
  code: string
}

export function extractBlocks(markdown: string, file: string): ExampleBlock[] {
  const blocks: ExampleBlock[] = []
  const lines = markdown.split("\n")
  for (let i = 0; i < lines.length; i++) {
    const open = /^(\s*)```(tsx|ts)\s*$/.exec(lines[i] ?? "")
    if (!open) continue
    const indent = open[1]?.length ?? 0
    const body: string[] = []
    let j = i + 1
    while (j < lines.length && !/^\s*```\s*$/.test(lines[j] ?? "")) {
      body.push((lines[j] ?? "").slice(indent))
      j++
    }
    const first = body.find((l) => l.trim() !== "") ?? ""
    if (!/^\/\/ (❌|fora da verificação:)/.test(first.trim())) {
      blocks.push({ file, line: i + 1, lang: open[2] as "ts" | "tsx", code: body.join("\n") })
    }
    i = j
  }
  return blocks
}

/** `@amfernandesinc/ui/<subpath>` → its file in src/, from package.json `exports`. */
function pathsFor(exportsMap: Record<string, unknown>): Record<string, string[]> {
  const paths: Record<string, string[]> = { "@/*": ["./src/*"] }
  for (const [key, value] of Object.entries(exportsMap)) {
    if (typeof value !== "object" || value === null) continue
    const target = (value as { import?: string }).import
    if (!target?.endsWith(".js")) continue
    const source = target.replace(/^\.\/dist\//, "./src/").replace(/\.js$/, "")
    paths[key === "." ? "@amfernandesinc/ui" : `@amfernandesinc/ui/${key.slice(2)}`] = [source]
  }
  return paths
}

export function checkBlocks(
  root: string,
  blocks: ExampleBlock[],
  exportsMap: Record<string, unknown>,
): string[] {
  const config = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile)
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
  const options: ts.CompilerOptions = {
    ...parsed.options,
    noEmit: true,
    jsx: ts.JsxEmit.ReactJSX,
    baseUrl: root,
    paths: pathsFor(exportsMap),
  }

  // Virtual files inside the repo, so node_modules resolves as for any app file.
  const dir = path.join(root, ".skill-examples")
  const virtual = new Map<string, ExampleBlock>()
  blocks.forEach((block, i) => {
    const name = `${path.basename(block.file, ".md")}-${String(i).padStart(3, "0")}.${block.lang}`
    virtual.set(path.join(dir, name), block)
  })

  const host = ts.createCompilerHost(options)
  const getSourceFile = host.getSourceFile.bind(host)
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
    const block = virtual.get(fileName)
    if (block) return ts.createSourceFile(fileName, block.code, languageVersion, true)
    return getSourceFile(fileName, languageVersion, onError, shouldCreate)
  }
  const fileExists = host.fileExists.bind(host)
  host.fileExists = (fileName) => virtual.has(fileName) || fileExists(fileName)
  const readFile = host.readFile.bind(host)
  host.readFile = (fileName) => virtual.get(fileName)?.code ?? readFile(fileName)

  const program = ts.createProgram({ rootNames: [...virtual.keys()], options, host })
  const problems: string[] = []
  for (const [fileName, block] of virtual) {
    const sourceFile = program.getSourceFile(fileName)
    if (!sourceFile) continue
    const diagnostics = [
      ...program.getSyntacticDiagnostics(sourceFile),
      ...program.getSemanticDiagnostics(sourceFile),
    ]
    for (const d of diagnostics) {
      const at = d.start != null ? sourceFile.getLineAndCharacterOfPosition(d.start).line : 0
      const message = ts.flattenDiagnosticMessageText(d.messageText, "\n")
      problems.push(`${block.file}:${block.line + 1 + at}: ${message}`)
    }
  }
  return problems
}
