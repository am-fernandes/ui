---
"@amfernandesinc/ui": patch
---

**Toast legível no tema escuro.** A descrição do toast e o X de fechar vinham com as cores fixas do tema claro do Sonner (`#3f3f3f` e quase preto): sobre a superfície escura davam contraste de 1,5:1 e 1,1:1. A descrição agora usa `--muted-foreground` e o X veste as cores do próprio toast (neutro ou, com `richColors`, o preenchimento do status), nos dois temas; o hover do X é a camada de estado dos outros controles, não mais um fundo quase branco.

As regras ficam num bloco de `tokens.css`, fora de camada como o CSS do Sonner. Quem importa `@amfernandesinc/ui/styles` não precisa fazer nada.
