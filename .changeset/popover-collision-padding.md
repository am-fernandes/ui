---
"@amfernandesinc/ui": minor
---

**Popover**: nova prop `collisionPadding` (default `16`) repassada ao `PopoverPrimitive.Content`. Evita que o conteúdo encoste/corte nas bordas da viewport ao dar flip/shift. Atenção: o default `16` altera o posicionamento de todos os Popovers existentes; passe `collisionPadding={0}` para manter o comportamento anterior.
