---
"@amfernandesinc/ui": minor
---

**`CommandPalette`: itens com o mesmo rótulo funcionam.** Dois "Exportar" (um em Clientes, outro em Contratos) ficavam destacados juntos, a seta pulava o último e o Enter disparava sempre o primeiro; numa lista de clientes homônimos, abria o registro errado. Cada item ganha `id`, que identifica o item no teclado e é o que `value`/`onValueChange` informam. Sem `id`, o rótulo continua sendo o valor, e um rótulo repetido é desambiguado pela posição.
