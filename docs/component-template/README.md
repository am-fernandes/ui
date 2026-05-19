# Component template

Arquivos-modelo para criar um novo componente em `@amfernandesinc/ui` seguindo as convenções da lib (`FieldShell`, `useFieldIds`, ARIA completo, estado de erro, ref forwarding, `displayName`).

## Como usar

1. **Copie os três arquivos** para a pasta-destino dentro de `src/`:

   ```bash
   # Exemplo: criando um field novo em src/forms/
   cp docs/component-template/component.tsx        src/forms/my-field.tsx
   cp docs/component-template/component.stories.tsx src/forms/my-field.stories.tsx
   cp docs/component-template/component.test.tsx   src/forms/my-field.test.tsx
   ```

2. **Renomeie**:
   - `Component` → `MyField` (PascalCase)
   - `ComponentProps` → `MyFieldProps`
   - `data-slot="component"` → `data-slot="my-field"`
   - `title: "Template/Component"` → `"Forms/MyField"` (ou a categoria correta)

3. **Ajuste os imports relativos** se a pasta-destino não for `src/primitives/`. O template já usa o caminho `../primitives/_internal/...` que funciona em `forms/`, `domain/`, `overlays/`, etc. Para um componente *dentro* de `src/primitives/`, troque por `./_internal/...`.

4. **Atualize `src/index.ts`** para exportar o componente no barrel:

   ```ts
   export { MyField, type MyFieldProps } from "./forms/my-field"
   ```

5. **Adicione subpath export** em `package.json` (seção `exports`):

   ```jsonc
   "./my-field": {
     "types": "./dist/forms/my-field.d.ts",
     "import": "./dist/forms/my-field.js"
   }
   ```

6. **Valide**:

   ```bash
   bun run typecheck && bun run test && bun run build
   ```

## O que o template demonstra

- `FieldShell` + `useFieldIds` para wiring de label/description/error.
- ARIA mínimo: `aria-invalid`, `aria-describedby`, `aria-required`.
- ClassName canônico para inputs: `flex w-full rounded-md border border-input bg-transparent px-3 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed`.
- Estado de erro substituindo o ring por `ring-destructive`.
- `ref` encaminhado para o `<input>`.
- `Component.displayName = "Component"` (renomeie junto com o componente).

Veja `CONTRIBUTING.md` na raiz do repo para o checklist completo de PR e a tabela de referências por padrão.

## Avisos

- Estes arquivos **não** são compilados pelo `tsup` nem exportados pelo barrel — `docs/` está fora dos entry points em `tsup.config.ts`.
- **Não** edite o template para resolver um caso específico do seu componente: mantenha-o genérico e ajuste a cópia em `src/`.
