---
"@amfernandesinc/ui": minor
---

**`FileUpload` não repete um arquivo na lista.** Com `multiple`, escolher de novo um arquivo que já estava na lista (ou soltá-lo duas vezes de uma vez) o colocava duas vezes, e ele seria enviado duas vezes. Agora o repetido fica de fora em silêncio: ele já está à vista. Conta como o mesmo arquivo o que tem nome, tamanho, data de modificação e tipo iguais; dois arquivos diferentes com o mesmo nome continuam entrando.
