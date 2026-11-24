---
"@amfernandesinc/ui": minor
---

**`CommandPalette`: nomes em português para o leitor de tela.** O campo de busca passa a ser nomeado pelo `title` (antes, só pelo placeholder), a lista de resultados deixa de se chamar "Suggestions" (novo `labels.list`, padrão "Resultados") e o indicador de carregamento deixa de se chamar "Loading..." (usa `labels.loading`). `heading` de um grupo aceita qualquer `ReactNode`, como o tipo prometia; antes, o que não fosse texto era descartado.
