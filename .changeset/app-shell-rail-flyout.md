---
"@amfernandesinc/ui": patch
---

**`AppShell`: grupo no trilho recolhido abre um menu com as páginas.** Antes, clicar em "Propostas" com o menu recolhido só trocava o `aria-expanded` e nada aparecia: as subpáginas ficavam inalcançáveis até achar "Expandir menu". Agora o grupo abre, ao lado do trilho, um menu com os filhos (clique, Enter ou Espaço; setas percorrem; Esc fecha e devolve o foco ao grupo). Os links do menu usam o mesmo `renderLink` e marcam a página atual com `aria-current="page"`.
