---
"@amfernandesinc/ui": minor
---

**`Collapsible` ganha `disabled`, e `title` com `trigger` vira erro de tipo.** `disabled` trava a seção: o gatilho fica desabilitado (o padrão esmaece, com cursor normal) e uma seção aberta continua legível. Um `trigger` próprio também recebe o `disabled`.

`title` e `trigger` eram mutuamente exclusivos só num comentário: passados juntos, `title` era ignorado em silêncio. Agora o TypeScript acusa. Se o seu código passa os dois, tire o `title`, que já não aparecia.
