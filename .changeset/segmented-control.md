---
"@amfernandesinc/ui": minor
---

**SegmentedControl** (novo): uma linha de 2 a 5 opções exclusivas, sempre visíveis, com exatamente uma marcada (`@amfernandesinc/ui/segmented-control`).

- É um campo (grupo de rádio), não navegação: use para mudar como o mesmo conteúdo aparece ("Lista | Grade", "Dia | Semana | Mês") ou como escolha compacta num formulário. Para conteúdos diferentes, cada um com seu painel, continue usando `Tabs`.
- `options` com `label`, `icon` e `disabled`; `value`/`defaultValue`/`onValueChange`; `label` obrigatório (nome do grupo para o leitor de tela).
- `size` (`sm`/`md`), `fill` (segmentos iguais ocupando a largura), `iconOnly` (rótulos viram nome acessível + tooltip), `disabled`.
- `name` e `required`: a escolha vai junto no envio do formulário.
- Teclado: uma parada só do Tab; setas movem e selecionam, inclusive num toque rápido de tecla com a página ocupada.
