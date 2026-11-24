---
"@amfernandesinc/ui": minor
---

**`Tree` funciona pelo teclado em qualquer nível e carrega filhos sob demanda.**

- As setas percorrem todos os itens visíveis, inclusive os aninhados; antes a seta para baixo parava no segundo nível. Uma tecla num item aninhado age só nele (Enter em "Unidade 102" não seleciona mais o bloco e o empreendimento junto). Digitar uma letra pula para o próximo item que começa com ela.
- O anel de foco fica na linha, não em volta do ramo inteiro, e cada item é nomeado só pelo seu rótulo.
- A seta abre e fecha sem mudar a seleção; o nome seleciona e abre uma pasta fechada. Espaço seleciona; Enter seleciona e abre ou fecha a pasta.
- `onLoadChildren(node)`: um nó com `hasChildren: true` e sem `children` pede os filhos ao abrir e mostra "Carregando…" até eles chegarem.
- `expanded` e `defaultExpanded` aceitam array ou `Set`; `defaultSelected` permite seleção não controlada; `labels` traduz os textos fixos, agora em português.
- Numa árvore grande, uma seta re-renderiza só os dois itens envolvidos.
- Em cores forçadas, o item selecionado ganha um contorno.
