/**
 * Componentes do barrel cujas props têm uma dada propriedade, declarada na
 * lib ou herdada (de `InputHTMLAttributes`, de um Radix). Os testes de
 * contrato usam isto para não deixar um componente novo de fora: todo campo
 * que aceita `name` entra em um formulário e precisa passar no contrato.
 */
import path from "node:path"
import ts from "typescript"

export function componentsWithProp(program: ts.Program, root: string, prop: string): string[] {
  const checker = program.getTypeChecker()
  const index = program.getSourceFile(path.join(root, "src/index.ts"))
  const moduleSymbol = index && checker.getSymbolAtLocation(index)
  if (!moduleSymbol) throw new Error("src/index.ts não encontrado no programa")
  const found = new Set<string>()
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    if (!/^[A-Z]/.test(exported.name)) continue
    const symbol =
      exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
    const decl = symbol.valueDeclaration ?? symbol.declarations?.[0]
    if (!decl || ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl)) continue
    const signatures = checker.getTypeOfSymbolAtLocation(symbol, decl).getCallSignatures()
    const hasProp = signatures.some((signature) => {
      const param = signature.getParameters()[0]
      if (!param) return false
      const props = checker.getTypeOfSymbolAtLocation(param, decl)
      const members = props.isUnion() ? props.types : [props]
      return members.some((member) => member.getProperty(prop) !== undefined)
    })
    if (hasProp) found.add(exported.name)
  }
  return [...found].sort()
}
