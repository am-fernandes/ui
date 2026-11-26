---
"@amfernandesinc/ui": minor
---

**`Input` ganha `size` e passa a medir 40px.** `size="sm"` (32px), `"md"` (40px, padrão) e `"lg"` (44px) definem a altura da caixa com a borda, pelos tokens de altura de controle. Antes a altura saía do padding e dava 42px, 2px a mais que o `Button` ao lado.

`size` é a prop do design system, não o atributo nativo `size` do `<input>` (que o componente já não repassava).
