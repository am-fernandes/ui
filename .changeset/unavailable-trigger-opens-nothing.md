---
"@amfernandesinc/ui": patch
---

**`Button` e `IconButton` ocupados não abrem menus.** Com `loading`, ou indisponíveis sem o `disabled` nativo (`asChild`, `IconButton` desabilitado), eles só ignoravam o clique. O `DropdownMenu` (e o `Select` do Radix) abrem no `pointerdown` e nas teclas Enter, Espaço e ↓, então um gatilho ocupado abria o menu do mesmo jeito: na `DataTable`, dava para exportar de novo com a primeira exportação ainda rodando. Agora o ponteiro e essas teclas também não fazem nada; o botão continua focável, e as outras teclas (Tab, Esc) chegam ao `onKeyDown`.
