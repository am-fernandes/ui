---
"@amfernandesinc/ui": minor
---

**Borda em dois níveis.** `--border` (10% da primária) fica para os divisores de dentro de uma superfície. As molduras que separam camadas passam a usar `--border-strong` (18%): Card, DataTable, Schedule, Alert padrão, DropdownMenu, Popover, Tour, Dialog, AlertDialog, Sheet, toasts e as bordas do menu lateral e da navbar do AppShell (`--sidebar-border`).

**Como migrar:** nas telas do app, a moldura que separa uma camada da outra (um painel, um card feito à mão, a borda de uma barra fixa) passa a `border-border-strong`; as divisórias de dentro de uma superfície (entre linhas, entre seções de um card) ficam com `border-border`. Quem usava `--sidebar-border` continua igual: ele agora aponta para `--border-strong`.
