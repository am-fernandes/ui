---
"@amfernandesinc/ui": patch
---

**`FileUpload`: passar de `maxFiles` recusa só os arquivos novos.** Com a lista já acima do limite (anexos em `items` que chegaram depois da escolha, por exemplo), escolher outro arquivo removia também um já escolhido. Os escolhidos agora ficam.
