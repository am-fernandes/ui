---
"@amfernandesinc/ui": minor
---

**`FileUpload` escreve os tamanhos em português.** A lista, a dica da dropzone e a mensagem de recusa mostravam "até 1.0 KB", com ponto decimal. Agora saem "até 1,0 KB" e "2,5 MB", e a unidade sobe quando o número chegaria a 1.024 (1.048.575 bytes são "1,0 MB", não "1024.0 KB").

O "até" da dica e as unidades entram em `labels`: `maxSizeHint: (limit) => string` e `sizeUnits: { bytes, kilobytes, megabytes, gigabytes }` (tipo `FileSizeUnits`). Quem conferia o texto antigo em teste precisa trocar o ponto pela vírgula.
