---
"@amfernandesinc/ui": minor
---

**`Accordion` ganha `keepMounted`.** Uma seção fechada era desmontada, e a API por `items` não dava escape: num formulário longo com `type="single"`, abrir a seção 2 apagava os campos não controlados da 1. Com `keepMounted`, as seções fechadas ficam no DOM, escondidas, e guardam o que têm.
