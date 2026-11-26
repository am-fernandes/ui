---
"@amfernandesinc/ui": minor
---

**`Breadcrumb` aceita o link do roteador.** `renderLink={({ href, ...props }) => <Link to={href} {...props} />}` desenha os passos com o `<Link>` do React Router ou do Next.js, e um clique navega sem recarregar a página. Cada item ganha `onClick`, que recebe o evento.
