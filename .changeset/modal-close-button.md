---
"@amfernandesinc/ui": patch
---

**O X de `Dialog` e `Sheet` virou um `IconButton` de 32px chamado "Fechar".** Era um ícone de 16×16px que clareava no hover, um alvo pequeno para o mouse e para o dedo, com o nome "Close" em inglês. Agora é um botão de 32px com a camada de estado no hover e no clique, como os outros controles, e `closeLabel` tem o padrão "Fechar". O título deixa espaço para o X e quebra antes dele.

Se você passava `closeLabel="Fechar"` só para traduzir, pode tirar.
