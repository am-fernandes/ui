---
"@amfernandesinc/ui": minor
---

**`Badge` ganha `dot`.** `<Badge variant="success" dot>Aprovado</Badge>` mostra um ponto na cor da variante ao lado de texto comum, sem fundo. É a forma para tabelas densas, onde uma coluna de badges cheios pesaria mais que o conteúdo; o fundo cheio fica para alertas e contadores. O rótulo herda a cor do texto em volta, então funciona também numa linha selecionada.

O `Badge` passa a pedir a impressão do fundo (`print-color-adjust: exact`), para o texto claro não sumir no papel.
