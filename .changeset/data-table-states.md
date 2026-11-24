---
"@amfernandesinc/ui": minor
---

**`DataTable`: carregando, vazio e erro.** "Carregando dados…" agora chega ao leitor de tela: ficava dentro de uma linha `aria-hidden`. A tabela tem uma única região de status, no DOM desde o início, que anuncia o carregamento e a busca que esvazia a tabela; a mensagem de vazio visível deixa de ser um `role="status"` que já nasce com texto. O esqueleto tem tantas linhas quanto o tamanho de página atual, inclusive depois de trocar o tamanho.

Novo estado de erro: `error` (texto ou `true`, que usa `labels.error`) aparece no corpo como alerta, no lugar de "Nenhum resultado.", e `onRetry` mostra um botão "Tentar de novo" (`labels.retry`). Testes que procuravam "Nenhum resultado." com `getByText` passam a achar o texto também na região de status: procure pela célula (`getByRole("cell", { name })`).
