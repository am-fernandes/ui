---
"@amfernandesinc/ui": patch
---

**`Tree`: reabrir um nó pede os filhos de novo.** Se `onLoadChildren` falhava, o nó ficava em "Carregando…" para sempre. Fechar e abrir agora chama de novo enquanto os filhos não chegarem.
