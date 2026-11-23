---
"@amfernandesinc/ui": minor
---

**`Checkbox` e `Switch` mostram a `description` mesmo sem `label`.** Sem rótulo visível (com `aria-label`, numa linha de tabela por exemplo), a descrição não aparecia e o `aria-describedby` apontava para um id que não existia na página. Agora ela aparece ao lado do controle e o descreve.
