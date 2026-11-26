---
"@amfernandesinc/ui": patch
---

**`EmptyState`: como anunciar dentro de uma `DataTable`.** A região de status da tabela só lê mensagens de texto; um `EmptyState` passado em `emptyMessage` fica mudo sem `announce`. A documentação agora orienta ligar `announce` à busca ou ao filtro (`announce={busca !== ""}`), para o anúncio sair uma vez só e não ler uma tabela que já carrega vazia.
