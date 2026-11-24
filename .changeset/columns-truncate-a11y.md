---
"@amfernandesinc/ui": minor
---

**`formattedColumn`: `truncate` alcançável por teclado, toque e leitor de tela.** O texto cortado passa a ser uma parada de Tab que abre o texto inteiro no foco; um toque abre e outro fecha; e o leitor de tela lê o texto inteiro no lugar do cortado. Antes o Tooltip ficava num `<span>` sem foco, só para o mouse. Dentro do botão de uma linha clicável, o texto cortado não vira uma segunda parada de Tab. Testes que liam `textContent` da célula passam a encontrar também o texto inteiro (num `sr-only`).
