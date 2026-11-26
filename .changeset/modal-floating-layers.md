---
"@amfernandesinc/ui": patch
---

**Listas dentro de `Popover` voltam a rolar quando ele está num `Dialog`, `AlertDialog` ou `Sheet`.** O modal trava a rolagem do resto da página, e o popover era renderizado no `<body>`, fora do modal: a roda do mouse e o dedo não rolavam a lista de um `Combobox` com 40 opções.

Dentro de um modal, `Popover`, `DropdownMenu` (com os submenus) e `Tooltip` agora são renderizados dentro do conteúdo do modal. Além de rolar, eles acompanham a animação de abrir e fechar do modal, ficam atrás de um segundo modal empilhado por cima, e um clique neles conta como clique dentro do modal. Fora de um modal nada muda: continuam indo para o `<body>`. Vale para tudo que usa o `Popover` da lib (`Combobox`, `DateInput`, `DateRangePicker`).

**Ao atualizar:** testes que procuravam o popover fora do diálogo (`within(dialog)` não o achava) agora o encontram dentro dele. Se o `className` do `Dialog` ou do `Sheet` tiver `overflow-*` (o jeito antigo de rolar o modal inteiro), os popovers desse modal continuam no `<body>`, para não serem cortados; tire o `overflow-*`, que o corpo já rola sozinho, e eles passam a rolar também.
