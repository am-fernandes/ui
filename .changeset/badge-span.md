---
"@amfernandesinc/ui": minor
---

**`Badge` passa a ser um `<span>` (quebra).** Era um `<div>`: dentro de um `<p>`, como num texto "Proposta <Badge>Aprovada</Badge> ontem", o HTML ficava inválido e o React avisava "<div> cannot be a descendant of <p>", com erro de hidratação no SSR. O visual não muda (`inline-flex` como antes).

Para migrar: quem tipava o ref como `HTMLDivElement` troca por `HTMLSpanElement` (`React.useRef<HTMLSpanElement>(null)`), e seletores CSS ou de teste como `div[data-slot="badge"]` passam a `[data-slot="badge"]`. Se precisar de um bloco, use `asChild` com o elemento que quiser.
