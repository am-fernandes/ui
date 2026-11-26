---
"@amfernandesinc/ui": minor
---

**Estados de hover, pressed e disabled do Astryx.**

- Hover e pressed viram uma camada translúcida da cor do texto do próprio controle (5% e 10%) por cima do fundo (`state-layer`), em vez de trocar o fundo (`hover:bg-accent`, `hover:bg-primary/90`…). A mesma regra serve para toda variante e para os dois temas. O hover só aparece em dispositivos com mouse.
- Itens de menu, combobox e command palette destacados (teclado ou ponteiro) usam a mesma camada (`state-hover`).
- Pressed encolhe o botão para 98% só com mouse, nunca no toque nem com movimento reduzido.
- Desabilitado fica `opacity-50` com cursor normal (antes `not-allowed`), sem reação a hover ou clique.
