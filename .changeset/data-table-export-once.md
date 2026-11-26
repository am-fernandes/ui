---
"@amfernandesinc/ui": patch
---

**`DataTable` exporta um arquivo por vez.** Durante uma exportação lenta (um `fetchAll` que demora), o menu abria de novo e uma segunda exportação começava: duas requisições, dois downloads, e o indicador de carregando sumia com a primeira ainda em andamento. Agora o gatilho ocupado não abre o menu e uma exportação nova só começa quando a anterior termina.
