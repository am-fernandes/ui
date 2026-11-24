---
"@amfernandesinc/ui": minor
---

**`Pagination` aceita o Link do roteador.** Com `getPageHref`, passe `renderLink={({ href, ...props }) => <Link to={href} {...props} />}` (o mesmo contrato do `AppShell`, do `Breadcrumb` e do `Token`) e trocar de página não recarrega mais a aplicação. Repasse todas as props: levam as classes, o `aria-current` e o clique que informa a página.
