---
"@amfernandesinc/ui": minor
---

**`FileUpload` ganha `id`, `name`, `required` e `ref`.** Com `name`, um `<input type="file">` oculto carrega os arquivos da lista, e o `FormData` de um form nativo os recebe sob esse nome (os `items`, que já estão no servidor, não vão). Com `required`, a dropzone mostra um `*`, o nome acessível ganha "(obrigatório)" e o form nativo não é enviado com a lista vazia: o aviso "Selecione um arquivo." aparece embaixo da dropzone e o foco vai para ela.

`id` vai para a dropzone (um `<label htmlFor>` de fora abre o seletor) e `ref` aponta para ela, de modo que o React Hook Form consegue focar o campo num erro. Os textos novos ficam em `labels` (`required`, `requiredError`).
