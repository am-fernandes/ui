---
"@amfernandesinc/ui": minor
---

**Os toasts continuam usáveis com um modal aberto.** Com um `Dialog`, `AlertDialog` ou `Sheet` aberto, o toast ficava inerte: o clique em "Tentar de novo" não chegava ao botão e ainda contava como clique fora, fechando o diálogo e perdendo o formulário; pelo teclado, Alt+T e Tab não chegavam ao toast.

Agora:

- o `Toaster` volta a aceitar o ponteiro mesmo com o modal aberto, e um clique num toast não fecha `Dialog` nem `Sheet`;
- Alt+T leva o foco para os toasts mesmo de dentro de um modal, Tab percorre os botões do toast e depois volta para o modal;
- Esc com o foco num toast devolve o foco para onde estava e não fecha o modal; o Esc seguinte fecha.
