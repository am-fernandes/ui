---
"@amfernandesinc/ui": minor
---

**IconButton** (novo): botão quadrado só com ícone (`@amfernandesinc/ui/icon-button`).

- `label` é obrigatório: vira o nome acessível e o tooltip (`tooltip={false}` desliga).
- Mesmas cores do `Button` (`variant`), com `ghost` como padrão. `size`: `sm` (32px), `md` (40px, a altura do `Button`) e `lg` (44px, alvo de toque).
- `loading` troca o ícone por um spinner e desabilita o botão.
- Nasce com `type="button"`, para não enviar o formulário em que estiver.
- O tooltip aparece no hover e no foco pelo teclado, mas não quando o foco é posto por código depois de um clique (ex.: o `Dialog` focando o primeiro botão, ou um menu devolvendo o foco ao gatilho) — assim ele não segura o próximo Esc.
