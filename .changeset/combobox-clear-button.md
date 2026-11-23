---
"@amfernandesinc/ui": minor
---

**`Combobox`: o botão de limpar fica fora do gatilho e some quando o campo está desabilitado.** Antes ele era um `span` focável dentro do `<button>` do gatilho: com o campo desabilitado, o Tab ainda chegava nele e o Enter apagava o valor. Agora é um `<button>` de verdade ao lado do gatilho, com alvo de 24 px, que não aparece em campo desabilitado; depois de limpar, o foco volta para o gatilho.
