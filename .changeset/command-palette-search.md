---
"@amfernandesinc/ui": minor
---

**`CommandPalette` expõe o termo buscado.** `search` e `onSearchChange` dão o texto digitado no campo (controlado ou não), e `shouldFilter={false}` desliga o filtro local para mostrar os resultados do servidor como vieram: dá para buscar um lead pelo CPF com `loading` enquanto a requisição corre (veja a story `ServerSearch`).

`value` e `onValueChange` continuam sendo o item destacado (o que o Enter escolheria), não o termo buscado, como a documentação dizia antes. `onValueChange` agora é chamado também quando `value` não é passado.
