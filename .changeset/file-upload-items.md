---
"@amfernandesinc/ui": minor
---

**`FileUpload` mostra anexos que já estão no servidor e o estado de cada envio.** A nova prop `items` (`{ id, name, size?, url?, status?, progress?, error? }[]`, tipo `FileUploadItem`) entra na mesma lista, antes dos arquivos escolhidos: com `url`, uma imagem ganha miniatura e abre ampliada, um PDF abre em outra aba e o resto é baixado; `status: "uploading"` mostra uma barra de progresso (sem `progress`, só "Enviando…") e `status: "error"` mostra o motivo (`error`, ou "Falha no envio"). Uma `url` que não seja `http:`, `https:` ou relativa é ignorada.

`onRemoveItem(id)` recebe a remoção de um item (sem ela, o item não tem botão de remover) e os itens contam para `maxFiles`. O fluxo usual é receber o arquivo em `onValueChange`, começar o envio e passá-lo para `items`. `value: File[]` continua funcionando como antes. Os textos novos ficam em `labels` (`uploading`, `uploadFailed`, `uploadProgress`).
