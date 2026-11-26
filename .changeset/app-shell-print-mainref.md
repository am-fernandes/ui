---
"@amfernandesinc/ui": minor
---

**`AppShell` imprime a página inteira e expõe o `<main>`.** Ao imprimir, o casco deixa de ter a altura da tela e a rolagem interna, e o menu lateral sai do papel: uma lista longa sai completa, não cortada na primeira tela. A nova prop `mainRef` entrega o `<main>` que rola, para a restauração de rolagem do roteador. O botão da marca reage com a camada de estado da lib, como os outros botões, e a largura do menu anima com os tokens de movimento.
