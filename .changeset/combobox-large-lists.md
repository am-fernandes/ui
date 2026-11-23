---
"@amfernandesinc/ui": minor
---

**`Combobox` serve para listas grandes e busca no servidor.** Com milhares de opções, abrir a lista e cada tecla levavam centenas de milissegundos, porque todas as opções eram montadas. Agora só as primeiras 100 que casam com a busca ficam na tela (`maxVisibleOptions`), mais as escolhidas, e uma linha diz quantas ficaram de fora e pede para continuar digitando (texto em `labels.hiddenOptions`).

Para buscar no servidor, `onSearchChange(termo)` recebe o que a pessoa digita, as opções que voltam vão em `options` e `shouldFilter={false}` desliga o filtro local. Com `loading`, a lista diz "Carregando…" (`labels.loading`) em vez de "Nenhuma opção encontrada.". A opção escolhida continua com o nome no gatilho mesmo quando a busca seguinte não a traz.
