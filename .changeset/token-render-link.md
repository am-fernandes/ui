---
"@amfernandesinc/ui": minor
---

**O link do `Token` conversa com o roteador.** O `Token` com `href` renderizava um `<a>` comum e chamava `onClick` sem o evento: `href="/propostas/1042"` recarregava a página e perdia o formulário aberto. Agora:

- `renderLink` troca o `<a>` pelo `<Link>` do seu roteador: `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`;
- `onClick` recebe o evento, então `event.preventDefault()` segura a navegação. Um `onClick={() => …}` sem parâmetro continua funcionando.
