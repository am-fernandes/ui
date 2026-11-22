---
"@amfernandesinc/ui": minor
---

**Status com um fundo forte só.** `Alert` (`info`, `success`, `warning`, `destructive`) e os marcadores de erro e de alerta do `Stepper` deixam o fundo claro e passam ao fundo forte do status, com o texto do token `-foreground` (escuro no alerta, branco nos outros).

- **Toasts:** por padrão continuam neutros (a superfície do popover), com o ícone na cor do status. Com `<Toaster richColors />`, usam o fundo forte do status em vez da paleta clara do Sonner.
- **Erro sobre superfície** (mensagem e borda de campo, item destrutivo do DropdownMenu, asterisco de obrigatório) usa `--destructive-text`, que no escuro é um vermelho clareado. A classe de erro dos campos passa a ser `border-destructive-text field-error`.
- Dentro de um `Alert` de status, o anel de foco usa a cor do texto do alerta.
- O `Alert` pede a impressão do fundo (`print-color-adjust: exact`), para o texto claro não sumir no papel.

**Quebra:** os tokens de fundo claro de status (`--status-success-bg`, `--status-success-text`, `--status-success-border` e os equivalentes de `warning`, `info` e `destructive`) e as classes `bg-status-*`, `text-status-*` e `border-status-*` deixam de existir. Troque por `bg-success text-success-foreground` (e os equivalentes), que são o fundo forte do status, ou por `<Badge variant="success" dot>` quando for uma célula de tabela.
