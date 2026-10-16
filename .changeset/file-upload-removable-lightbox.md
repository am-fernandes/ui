---
"@amfernandesinc/ui": minor
---

**FileUpload**:

- Nova prop `removable` (default `true`). Com `false`, o botão de remover some, mas a linha continua abrível e novos arquivos ainda podem ser adicionados pelo dropzone (append-only).
- `ImageLightbox` ganha botão "Fechar" explícito e, com a prop `downloadable`, botão "Baixar imagem" (`showSaveFilePicker` com fallback `<a download>`; `AbortError` é ignorado).
- O toast de sucesso aparece só quando o picker salva o arquivo. No fallback `<a download>` não há toast, porque o navegador não confirma o início do download.
- O botão de download fica desabilitado durante o salvamento e cai no `<a download>` quando `showSaveFilePicker` lança `SecurityError` (ex.: iframe) ou `NotAllowedError` (política negada).
- O foco inicial do lightbox vai para o botão "Fechar", para que Enter/Espaço imediato não dispare o download.
- Novos labels opcionais: `imageDownload`, `imageDownloadSuccess`, `imageDownloadError`, `imageClose` (defaults pt-BR), sem quebrar quem tipa `FileUploadLabels` completo.
