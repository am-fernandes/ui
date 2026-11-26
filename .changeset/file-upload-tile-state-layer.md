---
"@amfernandesinc/ui": minor
---

**A miniatura de um arquivo no `FileUpload` usa a camada de estado no hover.** Ao passar o mouse, a miniatura inteira ficava a 80% de opacidade, fora do padrão de hover e pressionado da biblioteca. Agora uma camada (`data-slot="file-upload-tile-layer"`) pinta o tom de hover e de pressionado por cima da miniatura, imagem incluída, e ela continua com opacidade total.
