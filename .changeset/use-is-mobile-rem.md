---
"@amfernandesinc/ui": minor
---

**`useIsMobile` usa o mesmo ponto de quebra do CSS.** A consulta passa de `max-width: 767px` para o complemento de `md:` em rem (`not all and (min-width: 48rem)`). Com a fonte padrão do navegador maior que 16px, o hook e o layout do Tailwind deixam de discordar: antes, entre 768px e o `md:` real, o CSS mostrava o layout de celular e o hook dizia que não era celular. A constante `MOBILE_QUERY` fica exportada pelo módulo.
