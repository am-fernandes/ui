---
"@amfernandesinc/ui": patch
---

**`DataTable` mantém a página controlada enquanto os dados não chegam.** Com `pageIndex` vindo da URL e `data={query.data ?? []}`, a tabela limitava a página à última que existia no primeiro render, sem nenhuma linha, e chamava `onPaginationChange({ pageIndex: 0 })`: o link para a página 4 abria na página 1. O mesmo acontecia num refetch que esvaziava `data`. O limite agora espera as linhas (`loading` desligado e ao menos uma página); dados que diminuem com a tabela carregada continuam levando à última página.
