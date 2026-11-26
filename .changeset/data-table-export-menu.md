---
"@amfernandesinc/ui": patch
---

**`DataTable`: o menu de exportação é o `DropdownMenu` da lib.** O menu deixa de ser um `role="menu"` sem setas dentro de um popover de diálogo: setas, Home/End, digitação e Escape funcionam, e o foco volta ao botão ao fechar. Enquanto o arquivo é gerado, o botão fica ocupado (`aria-busy`, sem perder o foco) em vez de desativado. Os itens passam a ter `data-slot="dropdown-menu-item"` (antes `data-table-download-*`).
