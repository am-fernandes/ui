/**
 * Gera a referência de API da skill (`skills/designing-with-amfernandesinc-ui/
 * reference/api/*.md`) a partir dos tipos do código: cada export do barrel,
 * com as props declaradas na lib, padrões, JSDoc e os textos de `labels`.
 *
 * A saída é determinística, para que um teste compare o que está commitado
 * com o que o código gera hoje (ver skill-api.test.ts).
 */
import path from "node:path"
import ts from "typescript"

export const CATEGORIES = [
  { dir: "primitives", file: "primitives.md", title: "Primitivos" },
  { dir: "forms", file: "forms.md", title: "Formulários" },
  { dir: "domain", file: "domain.md", title: "Domínio (Brasil, dinheiro, arquivos)" },
  { dir: "overlays", file: "overlays.md", title: "Overlays e feedback" },
  { dir: "navigation", file: "navigation.md", title: "Navegação" },
  { dir: "data", file: "data.md", title: "Exibição de dados" },
  { dir: "lib", file: "helpers.md", title: "Helpers (lib)" },
  { dir: "hooks", file: "hooks.md", title: "Hooks" },
] as const

const HEADER = (title: string) =>
  `<!-- Gerado por \`bun run skill:api\` a partir de src/. Não edite à mão: o teste scripts/lib/skill-api.test.ts falha se este arquivo e o código divergirem. -->\n\n# API: ${title}\n`

export function createProgram(root: string): ts.Program {
  const configPath = path.join(root, "tsconfig.json")
  const config = ts.readConfigFile(configPath, ts.sys.readFile)
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
  return ts.createProgram({
    rootNames: [path.join(root, "src/index.ts")],
    options: { ...parsed.options, noEmit: true },
  })
}

/** `src/primitives/button.tsx` → `button`, from package.json `exports`. */
export function subpathsBySource(exportsMap: Record<string, unknown>): Map<string, string> {
  const map = new Map<string, string>()
  for (const [key, value] of Object.entries(exportsMap)) {
    if (key === "." || typeof value !== "object" || value === null) continue
    const target = (value as { import?: string }).import
    if (!target) continue
    const source = target.replace(/^\.\/dist\//, "src/").replace(/\.js$/, "")
    map.set(source, key.slice(2))
  }
  return map
}

const oneLine = (text: string) => text.replace(/\s+/g, " ").trim()
/** The checker qualifies outside types with `import("/abs/path").`: drop it. */
const typeString = (checker: ts.TypeChecker, type: ts.Type, node: ts.Node) =>
  checker
    .typeToString(type, node, ts.TypeFormatFlags.NoTruncation)
    .replace(/import\("[^"]+"\)\./g, "")
const cell = (text: string) => oneLine(text).replace(/\|/g, "\\|")
const code = (text: string) => `\`${cell(text).replace(/`/g, "'")}\``

function docOf(symbol: ts.Symbol, checker: ts.TypeChecker): string {
  return ts.displayPartsToString(symbol.getDocumentationComment(checker))
}

function tagOf(symbol: ts.Symbol, checker: ts.TypeChecker, name: string): string | undefined {
  const tag = symbol.getJsDocTags(checker).find((t) => t.name === name)
  return tag?.text ? ts.displayPartsToString(tag.text) : undefined
}

function relative(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join("/")
}

/** Package a declaration comes from: `react`, `@radix-ui/react-tabs`, or null for the lib. */
function packageOf(file: string): string | null {
  const at = file.lastIndexOf("node_modules/")
  if (at === -1) return null
  const rest = file.slice(at + "node_modules/".length).split("/")
  const name = rest[0]?.startsWith("@") ? `${rest[0]}/${rest[1]}` : (rest[0] ?? "")
  return name === "@types/react" ? "react" : name
}

/** The function node of a component or helper, to read parameter defaults and signatures. */
function functionNode(decl: ts.Declaration): ts.SignatureDeclaration | undefined {
  if (ts.isFunctionDeclaration(decl)) return decl
  if (ts.isVariableDeclaration(decl) && decl.initializer) {
    const init = decl.initializer
    if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) return init
  }
  return undefined
}

/** Defaults written in the destructured props: `size = "md"` → `size: "md"`. */
function bindingDefaults(fn: ts.SignatureDeclaration | undefined): Map<string, string> {
  const map = new Map<string, string>()
  const first = fn?.parameters[0]
  if (!first || !ts.isObjectBindingPattern(first.name)) return map
  for (const element of first.name.elements) {
    if (!element.initializer) continue
    const key = element.propertyName ?? element.name
    if (ts.isIdentifier(key) || ts.isStringLiteral(key)) {
      map.set(key.text, oneLine(element.initializer.getText()))
    }
  }
  return map
}

interface PropRow {
  name: string
  type: string
  required: boolean
  fallback?: string
  doc: string
}

function propRows(
  type: ts.Type,
  checker: ts.TypeChecker,
  defaults: Map<string, string>,
): { own: PropRow[]; inherited: Map<string, Set<string>> } {
  const own: PropRow[] = []
  const inherited = new Map<string, Set<string>>()
  for (const prop of checker.getPropertiesOfType(type)) {
    const decls = prop.getDeclarations() ?? []
    const libDecl = decls.find((d) => packageOf(d.getSourceFile().fileName) === null)
    if (!libDecl) {
      for (const d of decls) {
        const pkg = packageOf(d.getSourceFile().fileName) ?? "?"
        const parent = d.parent
        const owner =
          parent && (ts.isInterfaceDeclaration(parent) || ts.isTypeAliasDeclaration(parent))
            ? parent.name.text
            : "?"
        const set = inherited.get(pkg) ?? new Set<string>()
        set.add(owner)
        inherited.set(pkg, set)
      }
      continue
    }
    let typeText: string
    if ((ts.isPropertySignature(libDecl) || ts.isPropertyDeclaration(libDecl)) && libDecl.type) {
      typeText = libDecl.type.getText()
    } else {
      const t = checker.getTypeOfSymbolAtLocation(prop, libDecl)
      typeText = typeString(checker, t, libDecl)
        // An optional prop's type, as the checker writes it, ends in `| undefined`.
        .replace(/( \| null)? \| undefined$/, "")
    }
    own.push({
      name: prop.getName(),
      type: typeText,
      required: (prop.flags & ts.SymbolFlags.Optional) === 0,
      fallback: defaults.get(prop.getName()) ?? tagOf(prop, checker, "default"),
      doc: docOf(prop, checker),
    })
  }
  return { own, inherited }
}

function propsTable(rows: PropRow[]): string {
  if (rows.length === 0) return "_Sem props próprias._\n"
  const lines = ["| Prop | Tipo | Padrão | Descrição |", "|---|---|---|---|"]
  for (const row of rows) {
    const fallback = row.required ? "**obrigatória**" : row.fallback ? code(row.fallback) : "—"
    lines.push(`| \`${row.name}\` | ${code(row.type)} | ${fallback} | ${cell(row.doc) || "—"} |`)
  }
  return `${lines.join("\n")}\n`
}

function inheritedNote(inherited: Map<string, Set<string>>): string {
  if (inherited.size === 0) return ""
  const parts = [...inherited.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pkg, owners]) => {
      const names = [...owners]
        .filter((o) => o !== "?" && o !== "DOMAttributes" && o !== "AriaAttributes")
        .sort()
      const label = pkg === "react" ? "atributos HTML do React" : `props de \`${pkg}\``
      return names.length ? `${label} (${names.map((n) => `\`${n}\``).join(", ")})` : label
    })
  return `\nRepassa também: ${parts.join("; ")}.\n`
}

function componentSection(
  name: string,
  symbol: ts.Symbol,
  decl: ts.Declaration,
  checker: ts.TypeChecker,
  importLine: string,
): string {
  const fn = functionNode(decl)
  const type = checker.getTypeOfSymbolAtLocation(symbol, decl)
  const signature = type.getCallSignatures()[0]
  const param = signature?.getParameters()[0]
  let out = `### ${name}\n\n${importLine}\n\n`
  const doc = oneLine(docOf(symbol, checker))
  if (doc) out += `${doc}\n\n`
  if (!param) return `${out}_Sem props._\n`
  const propsType = checker.getTypeOfSymbolAtLocation(param, decl)
  const defaults = new Map([...cvaDefaults(decl.getSourceFile()), ...bindingDefaults(fn)])
  const members = propsType.isUnion()
    ? propsType.types.filter((t) => checker.getPropertiesOfType(t).length > 0)
    : [propsType]
  if (members.length > 1) {
    out += "As props são uma união: cada forma abaixo é um jeito de usar o componente.\n\n"
    for (const member of members) {
      const label = typeString(checker, member, decl)
      const { own, inherited } = propRows(member, checker, defaults)
      out += `#### \`${label}\`\n\n${propsTable(own)}${inheritedNote(inherited)}\n`
    }
    return out
  }
  const { own, inherited } = propRows(propsType, checker, defaults)
  return `${out}${propsTable(own)}${inheritedNote(inherited)}`
}

function signatureText(fn: ts.SignatureDeclaration, name: string, checker: ts.TypeChecker): string {
  const typeParams = fn.typeParameters?.length
    ? `<${fn.typeParameters.map((p) => p.getText()).join(", ")}>`
    : ""
  const params = fn.parameters.map((p) => oneLine(p.getText())).join(", ")
  let ret = fn.type ? oneLine(fn.type.getText()) : ""
  if (!ret) {
    const sig = checker.getSignatureFromDeclaration(fn)
    ret = sig ? typeString(checker, sig.getReturnType(), fn) : "void"
  }
  return `${name}${typeParams}(${params}): ${ret}`
}

/** `defaultVariants` of the cva calls in a file: the defaults of `variant`-like props. */
function cvaDefaults(file: ts.SourceFile): Map<string, string> {
  const map = new Map<string, string>()
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && node.expression.getText() === "cva") {
      const config = node.arguments[1]
      if (config && ts.isObjectLiteralExpression(config)) {
        for (const p of config.properties) {
          if (
            ts.isPropertyAssignment(p) &&
            p.name.getText() === "defaultVariants" &&
            ts.isObjectLiteralExpression(p.initializer)
          ) {
            for (const d of p.initializer.properties) {
              if (ts.isPropertyAssignment(d))
                map.set(d.name.getText(), oneLine(d.initializer.getText()))
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  return map
}

function cvaSection(init: ts.CallExpression): string {
  const config = init.arguments[1]
  if (!config || !ts.isObjectLiteralExpression(config)) return ""
  const variants = config.properties.find(
    (p): p is ts.PropertyAssignment =>
      ts.isPropertyAssignment(p) && p.name.getText() === "variants",
  )
  const defaults = config.properties.find(
    (p): p is ts.PropertyAssignment =>
      ts.isPropertyAssignment(p) && p.name.getText() === "defaultVariants",
  )
  if (!variants || !ts.isObjectLiteralExpression(variants.initializer)) return ""
  const defaultOf = new Map<string, string>()
  if (defaults && ts.isObjectLiteralExpression(defaults.initializer)) {
    for (const p of defaults.initializer.properties) {
      if (ts.isPropertyAssignment(p))
        defaultOf.set(p.name.getText(), oneLine(p.initializer.getText()))
    }
  }
  const lines: string[] = []
  for (const p of variants.initializer.properties) {
    if (!ts.isPropertyAssignment(p) || !ts.isObjectLiteralExpression(p.initializer)) continue
    const options = p.initializer.properties.map((o) => (o.name ? o.name.getText() : "?"))
    const key = p.name.getText()
    const fallback = defaultOf.get(key)
    lines.push(
      `- \`${key}\`: ${options.map((o) => `\`${o.replace(/^"|"$/g, "")}\``).join(", ")}${fallback ? ` (padrão ${code(fallback)})` : ""}`,
    )
  }
  return lines.length ? `Variantes:\n\n${lines.join("\n")}\n` : ""
}

function otherSection(
  name: string,
  symbol: ts.Symbol,
  decl: ts.Declaration,
  checker: ts.TypeChecker,
  importLine: string,
): string {
  const doc = oneLine(docOf(symbol, checker))
  const head = `### ${name}\n\n${importLine}\n\n${doc ? `${doc}\n\n` : ""}`

  // Types and interfaces: their source, comments included.
  if (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl)) {
    return `${head}\`\`\`ts\n${decl.getText()}\n\`\`\`\n`
  }

  const fn = functionNode(decl)
  if (fn) {
    const sigs = ts.isFunctionDeclaration(decl)
      ? (symbol.getDeclarations() ?? []).filter(ts.isFunctionDeclaration)
      : [fn]
    const overloads = sigs.filter((s) => !s.body || sigs.length === 1)
    const shown = overloads.length ? overloads : sigs
    const text = shown.map((s) => signatureText(s, name, checker)).join("\n")
    return `${head}\`\`\`ts\n${text}\n\`\`\`\n`
  }

  if (ts.isVariableDeclaration(decl) && decl.initializer) {
    const init = decl.initializer
    if (ts.isCallExpression(init) && init.expression.getText() === "cva") {
      return `${head}Gera as classes do componente (class-variance-authority).\n\n${cvaSection(init)}`
    }
    const literal =
      ts.isAsExpression(init) || ts.isSatisfiesExpression(init) ? init.expression : init
    if (
      ts.isObjectLiteralExpression(literal) ||
      ts.isArrayLiteralExpression(literal) ||
      ts.isStringLiteral(literal) ||
      ts.isNoSubstitutionTemplateLiteral(literal) ||
      ts.isNumericLiteral(literal)
    ) {
      const typed = decl.type ? `: ${decl.type.getText()}` : ""
      return `${head}\`\`\`ts\nconst ${name}${typed} = ${init.getText()}\n\`\`\`\n`
    }
  }
  // A declared type says it best (`typeof sonnerToast`), not its expansion.
  const declared =
    ts.isVariableDeclaration(decl) && decl.type
      ? decl.type.getText()
      : typeString(checker, checker.getTypeOfSymbolAtLocation(symbol, decl), decl)
  return `${head}\`\`\`ts\nconst ${name}: ${declared}\n\`\`\`\n`
}

type Kind = "component" | "hook" | "function" | "value" | "type"

function kindOf(
  name: string,
  symbol: ts.Symbol,
  decl: ts.Declaration,
  checker: ts.TypeChecker,
): Kind {
  if (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl)) return "type"
  const callable =
    checker.getTypeOfSymbolAtLocation(symbol, decl).getCallSignatures().length > 0 &&
    functionNode(decl) !== undefined
  if (callable && /^[A-Z]/.test(name)) return "component"
  if (callable && /^use[A-Z]/.test(name)) return "hook"
  if (callable) return "function"
  return "value"
}

const KIND_ORDER: Kind[] = ["component", "hook", "function", "value", "type"]

export interface ApiEntry {
  name: string
  kind: Kind
  source: string
  file: string
}

export function generateApi(
  program: ts.Program,
  root: string,
  subpaths: Map<string, string>,
): { files: Map<string, string>; entries: ApiEntry[] } {
  const checker = program.getTypeChecker()
  const index = program.getSourceFile(path.join(root, "src/index.ts"))
  if (!index) throw new Error("src/index.ts não está no programa")
  const moduleSymbol = checker.getSymbolAtLocation(index)
  if (!moduleSymbol) throw new Error("src/index.ts não tem exports")

  interface Item {
    name: string
    symbol: ts.Symbol
    decl: ts.Declaration
    kind: Kind
    source: string
    external: string | null
  }
  const items: Item[] = []
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const symbol =
      exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
    const decl = symbol.getDeclarations()?.[0]
    if (!decl) continue
    const file = decl.getSourceFile().fileName
    const external = packageOf(file)
    // Listed under the module src/index.ts takes it from (the one a subpath
    // points to), even when it is declared in an internal file.
    const via = reexportSource(exported, root)
    items.push({
      name: exported.getName(),
      symbol,
      decl,
      kind: kindOf(exported.getName(), symbol, decl, checker),
      source: via.replace(/\.(tsx|ts)$/, ""),
      external,
    })
  }

  const files = new Map<string, string>()
  const entries: ApiEntry[] = []
  for (const category of CATEGORIES) {
    const inCategory = items.filter((i) => i.source.startsWith(`src/${category.dir}/`))
    const bySource = new Map<string, Item[]>()
    for (const item of inCategory) {
      const list = bySource.get(item.source) ?? []
      list.push(item)
      bySource.set(item.source, list)
    }
    let out = HEADER(category.title)
    for (const source of [...bySource.keys()].sort()) {
      const list = (bySource.get(source) ?? []).sort(
        (a, b) =>
          KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.name.localeCompare(b.name),
      )
      const sub = subpaths.get(source)
      out += `\n## \`${source.replace(/^src\//, "")}\`${sub ? ` — \`@amfernandesinc/ui/${sub}\`` : ""}\n`
      for (const item of list) {
        const importLine =
          item.kind === "type"
            ? `\`import type { ${item.name} } from "@amfernandesinc/ui"\``
            : `\`import { ${item.name} } from "@amfernandesinc/ui"\`${sub ? ` ou \`"@amfernandesinc/ui/${sub}"\`` : ""}`
        out += "\n"
        if (item.external) {
          out += `### ${item.name}\n\n${importLine}\n\nReexportado de \`${item.external}\` (mesmo tipo do pacote original).\n`
        } else if (item.kind === "component") {
          out += componentSection(item.name, item.symbol, item.decl, checker, importLine)
        } else {
          out += otherSection(item.name, item.symbol, item.decl, checker, importLine)
        }
        entries.push({ name: item.name, kind: item.kind, source, file: category.file })
      }
    }
    files.set(category.file, out)
  }

  const missing = items.filter((i) => !CATEGORIES.some((c) => i.source.startsWith(`src/${c.dir}/`)))
  if (missing.length) {
    throw new Error(`exports fora das categorias: ${missing.map((m) => m.name).join(", ")}`)
  }

  files.set("README.md", indexFile(entries))
  return { files, entries }
}

/** Where src/index.ts re-exports a name from: its `from "./data/data-table"`. */
function reexportSource(exported: ts.Symbol, root: string): string {
  const decl = exported.getDeclarations()?.[0]
  let node: ts.Node | undefined = decl
  while (node && !ts.isExportDeclaration(node)) node = node.parent
  const spec = node && ts.isExportDeclaration(node) ? node.moduleSpecifier : undefined
  if (spec && ts.isStringLiteral(spec)) {
    return `src/${spec.text.replace(/^\.\//, "")}`
  }
  return relative(root, decl?.getSourceFile().fileName ?? "")
}

const KIND_LABEL: Record<Kind, string> = {
  component: "Componentes",
  hook: "Hooks",
  function: "Funções",
  value: "Constantes",
  type: "Tipos",
}

function indexFile(entries: ApiEntry[]): string {
  let out =
    "<!-- Gerado por `bun run skill:api` a partir de src/. Não edite à mão. -->\n\n# API: índice\n\nTodo export de `@amfernandesinc/ui`, com o arquivo desta pasta onde ele está documentado. Procure o nome aqui e abra só o arquivo da categoria.\n"
  for (const kind of KIND_ORDER) {
    const list = entries.filter((e) => e.kind === kind).sort((a, b) => a.name.localeCompare(b.name))
    if (!list.length) continue
    out += `\n## ${KIND_LABEL[kind]} (${list.length})\n\n`
    out += `${list.map((e) => `- \`${e.name}\` → [${e.file}](./${e.file})`).join("\n")}\n`
  }
  return out
}
