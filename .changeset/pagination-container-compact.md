---
"@amfernandesinc/ui": patch
---

**`Pagination` não quebra em duas linhas no celular.** Com números (`variant="pages"`), quando o espaço não comporta todos os controles numa linha, a paginação passa sozinha ao layout compacto ("Página 3 de 10" entre anterior e próxima), por container query: vale o espaço do contêiner, não a tela. Abaixo de 320px os atalhos de primeira e última página também saem.

A `<nav>` da paginação passa a ocupar a largura do pai (`w-full`) para medir o espaço que tem. Dentro de uma linha flex, dê a ela o espaço que deve ocupar (`flex-1`, por exemplo) com `className`.
