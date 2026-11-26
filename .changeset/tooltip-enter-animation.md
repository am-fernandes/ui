---
"@amfernandesinc/ui": patch
---

**`Tooltip` volta a ter animação de entrada.** As classes de entrada esperavam `data-state="open"`, que o Radix nunca põe num tooltip (ele usa `delayed-open` e `instant-open`): o tooltip aparecia de uma vez e só a saída era animada. Agora ele surge com o fade e o zoom curtos do sistema.
