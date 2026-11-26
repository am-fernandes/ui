---
"@amfernandesinc/ui": minor
---

**`AppShell` aceita o Link do roteador.** Com `renderLink={({ href, ...props }) => <Link to={href} {...props} />}` (React Router) ou `renderLink={(props) => <Link {...props} />}` (Next.js), os itens com `href` navegam sem recarregar a página. Repasse todas as props: elas levam as classes, o `aria-current` e o clique que fecha o menu no celular.

O `onClick` do item passa a receber o evento (`event.preventDefault()` cancela o link), e Ctrl/⌘/Shift-clique abre o link em outra aba sem mexer na página atual: o menu não fecha e o `onClick` não roda. O item ativo leva `aria-current="page"` também quando é uma ação (sem `href`) ou um grupo.
