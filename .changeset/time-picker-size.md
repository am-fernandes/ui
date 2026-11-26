---
"@amfernandesinc/ui": minor
---

**`TimePicker` com a altura dos outros campos, e `size`.** A caixa media 46 px, porque a altura vinha do respiro vertical, e não alinhava com um campo ou botão ao lado. Agora a altura vem do tamanho de controle: `size` (`"sm"`, `"md"` ou `"lg"`, padrão `"md"`) dá 32, 40 ou 44 px. O texto fica em 16 px em telas de toque (antes dependia da largura da tela).
