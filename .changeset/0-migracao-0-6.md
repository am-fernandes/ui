---
"@amfernandesinc/ui": minor
---

**Migração da 0.5 para a 0.6: leia antes de atualizar.** O passo a passo, com antes, depois e o que fazer, está na página **Migração 0.6** do Storybook (`src/docs/Migration.mdx`). As mudanças que quebram, em ordem de impacto:

- Os tokens de status claros (`--status-*-bg`, `-text`, `-border` e as classes `bg-status-*`, `text-status-*`, `border-status-*`) saem: o app compila e só perde a cor. Troque por `bg-success text-success-foreground` e equivalentes.
- `Sidebar` sai; entra `AppShell` (`@amfernandesinc/ui/app-shell`), dono do layout.
- `Button` nasce com `type="button"`: o botão que envia o formulário precisa de `type="submit"`.
- `lib/date` trabalha em `America/Sao_Paulo`: um instante em UTC aparece na hora de Brasília (`14:30Z` → `11:30`).
- `DateInput` é um campo de texto: o `ref` é `HTMLInputElement` e o papel é `textbox`.
- `--accent` deixa de ser cinza (use `bg-muted` para fundo neutro), `--background` é só a página (superfícies em `bg-card`) e todas as cores mudam de valor.
- Raio em três níveis (`rounded-md` passa a 8px, `rounded-lg`+ a 12px) e borda translúcida em dois níveis (`border-border-strong` nas molduras).
- `Badge` é `<span>`, `Video` usa `objectFit="contain"`, `Image` sem `src` mostra "Sem imagem", `addMonths` para no fim do mês e a exportação da `DataTable` não traz mais o `xlsx`.
