---
"@amfernandesinc/ui": minor
---

**`Button` ganha `size` e todas as variantes passam a ter a mesma caixa.** `size="sm"` (32px), `"md"` (40px, padrão) e `"lg"` (44px) definem a altura da caixa inteira, borda incluída, pelos tokens de altura de controle. Antes a altura saía do padding: o botão `outline` media 42px e os outros 40px.

Toda variante agora tem 1px de borda (transparente fora do `outline`), então um botão com borda e um sem borda do mesmo tamanho têm a mesma altura e, com o mesmo texto, a mesma largura. Na prática: o `outline` fica 2px mais baixo e os demais 2px mais largos.

`buttonVariants()` aceita `size` e, sem ele, devolve o botão `md`. Quem sobrescreve a altura por `className` (`h-8`, `size-9`) continua funcionando.
