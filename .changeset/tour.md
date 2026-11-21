---
"@amfernandesinc/ui": minor
---

**Tour** (novo): tour guiado de onboarding (`@amfernandesinc/ui/tour`). Um balão por etapa, apontando para um elemento da página.

- `steps`: `{ target, title, content?, side?, align? }`. O `target` pode ser um ref, um seletor CSS ou uma função que devolve o elemento. Sem alvo na página, o balão aparece centralizado.
- `open` controla quando o tour roda. `onClose(reason)` diz como terminou: `"completed"` (Concluir na última etapa) ou `"dismissed"` (X ou Esc). Salve a conclusão ali para não repetir o tour.
- `spotlight` escurece a página em volta do alvo (padrão ligado), sem sombra, e acompanha rolagem e redimensionamento. `showProgress` mostra "2 de 5".
- Não é modal: clicar fora não encerra o tour. O foco vai para o balão a cada etapa, a troca de etapa é anunciada ao leitor de tela e, no fim, o foco volta para onde estava.
- Etapa controlada (`step`/`onStepChange`) ou não (`defaultStep`, que reinicia a cada abertura). Textos em pt-BR, trocáveis por `labels`.
