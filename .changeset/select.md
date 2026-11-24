---
"@amfernandesinc/ui": minor
---

**Novo `Select`** (`@amfernandesinc/ui/select`): seleção simples para listas curtas, sem busca ("Sim / Não / Talvez", estágio do lead, linhas por página), onde o `Combobox` é pesado demais.

- `options` com `{ value, label, disabled? }` ou grupos `{ label, options }`; `value`/`onValueChange` ou `defaultValue`; `placeholder` (ou `labels.placeholder`, padrão "Selecione…").
- Anatomia de campo da biblioteca: `label`, `labelPosition`, `description`, `error`, `required`, `disabled`, `readOnly` e `size` (`sm`/`md`/`lg`, a mesma altura de um `Input`).
- Com `name`, um `<select>` nativo leva o valor ao `FormData`: nada é enviado antes de uma escolha, `required` é checado pelo navegador e o reset do formulário volta ao `defaultValue`.
- Teclado e busca por letra do Radix; a opção escolhida tem um ✓; a lista segue o visual do `DropdownMenu` e cabe no espaço disponível; funciona dentro de um `Dialog` sem fechá-lo.
- Nova dependência: `@radix-ui/react-select`.
