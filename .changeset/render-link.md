---
"@amfernandesinc/ui": minor
---

**Contrato `renderLink` para o link do roteador.** Os tipos `RenderLink` e `RenderLinkProps` (também em `@amfernandesinc/ui/lib/render-link`) descrevem a função que troca o `<a>` da lib pelo link do React Router ou do Next.js, sem recarregar a página: `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`. Os componentes de navegação passam a aceitar essa prop.
