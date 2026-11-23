---
"@amfernandesinc/ui": minor
---

**Modal aberto sobre outro escurece o de baixo.** O fundo escuro de todo modal ficava numa camada abaixo de todos os modais: um `AlertDialog` de "Descartar alterações?" aberto sobre um `Dialog` aparecia branco ao lado de um diálogo branco e claro, sem deixar óbvio qual dos dois esperava a resposta. Agora o fundo fica na camada do próprio modal, logo antes dele, e um modal novo escurece também os que estão abertos por baixo. Vale para `Dialog`, `AlertDialog`, `Sheet` e o menu móvel do `AppShell`.
