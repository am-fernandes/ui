---
"@amfernandesinc/ui": minor
---

**`MultiInput`, `InputOTP` e `FileUpload` aceitam `onBlur`.** Sem ele, o React Hook Form com `mode: "onBlur"` não validava esses campos ao sair deles, e `touched` nunca ficava verdadeiro. `onBlur` é chamado quando o foco sai do campo inteiro: passar do campo de digitação para o × de um item (`MultiInput`), ou da dropzone para a lista de arquivos e para o diálogo da imagem (`FileUpload`), não conta. No `MultiInput`, o texto digitado já virou item quando `onBlur` chega.
