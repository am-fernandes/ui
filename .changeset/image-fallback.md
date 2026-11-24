---
"@amfernandesinc/ui": minor
---

**`Image`: estado "sem imagem", `fallback`, `labels` e `blurDataURL`.**

- `src` aceita vazio, `null` ou `undefined`: um imóvel sem foto mostra um ícone e "Sem imagem", não mais "Falha ao carregar imagem".
- `fallback` troca o que aparece no lugar da imagem (sem `src`, endereço recusado ou erro de carga), por exemplo as iniciais de um lead. O texto padrão vem de `labels` (`empty`, `error`) e some em caixas com menos de 8rem.
- O `alt` continua com o leitor de tela quando a imagem falha ou o endereço é recusado: o fallback vira `role="img"` com esse nome. Antes, com endereço recusado, ele sumia.
- `placeholder="blur"` com `blurDataURL` mostra a miniatura borrada até a foto chegar; sem ela continua sendo um bloco neutro (agora documentado assim).
- Uma imagem que já estava carregada quando o React montou (SSR com cache) aparece, em vez de ficar transparente.
- A documentação de `allowedProtocols` dizia "opt in": ela **substitui** a lista padrão. Para acrescentar, use `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "data:"]`.
- O fade usa os tokens de movimento e some com movimento reduzido. O `ref` aponta para o `<img>` e é `null` enquanto o fallback aparece.
