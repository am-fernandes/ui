---
"@amfernandesinc/ui": minor
---

**Toast plano, como o resto do sistema.** O CSS do Sonner, fora de camada, vencia as regras da lib: o toast tinha sombra, texto de 13px, o raio de 8px do `--radius` obsoleto e um X de 20px. Agora ele não tem sombra, usa o texto de 14px do sistema e o raio dos containers flutuantes (12px, como `Popover` e `Dialog`), e o X tem 24px. No foco pelo teclado, toast, X e botão de ação mostram o anel de foco do sistema em vez da sombra do Sonner.
