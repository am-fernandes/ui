---
"@amfernandesinc/ui": minor
---

**DropdownMenu** (novo): menu de ações preso a um gatilho (`@amfernandesinc/ui/dropdown-menu`). Data-driven, como o resto da lib: as linhas vêm em `items`.

- Ação (padrão): `label`, `icon`, `shortcut`, `onSelect`, `variant: "destructive"`, `disabled`, `keepOpen`. Com `href` (e `target`), a linha vira um link de verdade; protocolos inseguros são descartados.
- `{ type: "checkbox" }`, `{ type: "radio" }`, `{ type: "group" }` (com título), `{ type: "separator" }` e `{ type: "submenu" }`.
- `trigger` aceita qualquer elemento focável — `Button`, `IconButton`…
- Teclado completo (setas, Home/End, busca por letra, Esc devolve o foco ao gatilho). Dentro de um `Dialog`, Esc e o clique num item fecham só o menu.

Nova dependência: `@radix-ui/react-dropdown-menu`.
