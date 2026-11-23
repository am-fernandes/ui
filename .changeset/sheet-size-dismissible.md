---
"@amfernandesinc/ui": minor
---

**`Sheet` ganha `size`, `dismissible` e `onOpenAutoFocus`, como o `Dialog`.** A largura dos painéis laterais era fixa em 384px. Agora `size="sm"` dá 320px (uma lista curta de filtros), `"md"` continua com os 384px de hoje e é o padrão, e `"lg"` dá 672px (um detalhe com formulário em duas colunas). No celular o painel segue com 3/4 da tela; painéis de cima e de baixo continuam com a largura toda.

`dismissible={false}` esconde o X e faz o Esc e o clique fora não fecharem, para uma etapa que precisa terminar num botão do rodapé. `onOpenAutoFocus` escolhe o primeiro campo focado ao abrir.
