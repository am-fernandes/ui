---
"@amfernandesinc/ui": minor
---

**Busca sem acento e ordenação em português num helper só.** `normalizeText`, `matchesSearch` e `compareText` (também em `@amfernandesinc/ui/lib/text`): `matchesSearch("João Álvares", "joao")` é verdadeiro, e `nomes.sort(compareText)` põe "Álvaro" antes de "Bruno" e "Bloco 2" antes de "Bloco 10". O Combobox já usa o mesmo helper.
