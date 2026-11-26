---
"@amfernandesinc/ui": patch
---

**`Tree`: reabrir um nó pede os filhos de novo.** Se `onLoadChildren` falhava, o nó ficava em "Carregando…" para sempre. Fechar e abrir agora chama de novo enquanto os filhos não chegarem. Devolva a promise da carga em `onLoadChildren`: enquanto ela roda, fechar e abrir não pede de novo (um app que acrescenta o que chega receberia cada filho duas vezes), e uma carga que falhou volta a ser pedida ao reabrir.
