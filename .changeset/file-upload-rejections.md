---
"@amfernandesinc/ui": minor
---

**`FileUpload` explica por que recusou um arquivo.** Sem `onReject`, um arquivo acima de `maxSize`, de tipo fora de `accept` ou além de `maxFiles` sumia sem aviso; a foto da câmera passava pelo mesmo filtro. Agora o motivo de cada recusa aparece embaixo da dropzone ("planta.pdf: maior que 2,0 MB"), é anunciado ao leitor de tela e some na tentativa seguinte.

Os textos ficam em `labels` (`rejectedType`, `rejectedSize`, `rejectedMaxFiles`). `onReject` continua sendo chamado. Quem já avisa por conta própria, com um toast por exemplo, pode desligar a mensagem embutida com `showRejections={false}`.
