---
"@amfernandesinc/ui": patch
---

**`IconButton` desabilitado continua com tooltip e alcançável pelo teclado.** Com o `disabled` nativo, o ícone ficava mudo: nenhum tooltip no hover e o Tab pulava o botão. Numa ação de linha de tabela não dava para saber o que era nem que estava travada.

Agora `disabled` (e `loading`) usam `aria-disabled`: o botão fica esmaecido, ignora clique, Enter e espaço e não envia o formulário, mas continua na ordem do Tab e mostra o tooltip. Em `loading` ele mantém o foco e o início é anunciado ao leitor de tela (`labels={{ loading }}`).

O atributo `disabled` deixa de existir no `<button>`: em testes, troque `toBeDisabled()` por `toHaveAttribute("aria-disabled", "true")`; em CSS, troque `:disabled` por `[aria-disabled="true"]`. Isso vale também para as setas de `Pagination` e do `Stepper` compacto, que usam o `IconButton`.
