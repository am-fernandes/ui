---
"@amfernandesinc/ui": minor
---

**`FileUpload` só abre imagem e PDF; o resto é baixado.** Na lista de arquivos, qualquer arquivo que não fosse imagem abria numa nova aba por um blob URL. Um blob URL pertence à origem da página: um `.html` escolhido pelo usuário rodava o script dele com os cookies e o `localStorage` da aplicação.

Agora uma imagem continua abrindo ampliada, um PDF abre em outra aba e qualquer outro arquivo é **baixado**. O botão desses arquivos passa a se chamar "Baixar {nome}" (`labels.downloadFile`), com ícone de download; o nome usado quando o arquivo não tem um fica em `labels.fileFallbackName`.
