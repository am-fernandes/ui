---
"@amfernandesinc/ui": minor
---

**FileUpload**:

- Nova prop `removable` (default `true`). Com `false`, a linha do arquivo continua abrível/visível mas sem botão de remover.
- `ImageLightbox` ganha botão "Baixar imagem" (`showSaveFilePicker` com fallback `<a download>`, feedback via toast, ignora `AbortError`) e botão "Fechar" explícito.
- Novos labels opcionais: `imageDownload`, `imageDownloadSuccess`, `imageDownloadError`, `imageClose` (defaults pt-BR), sem quebrar quem tipa `FileUploadLabels` completo.
- O botão de download é desabilitado durante o salvamento e cai no `<a download>` quando `showSaveFilePicker` lança `SecurityError` (ex.: iframe).
