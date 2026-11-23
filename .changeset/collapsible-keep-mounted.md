---
"@amfernandesinc/ui": minor
---

**`Collapsible` ganha `keepMounted`.** Fechar uma seção desmontava o conteúdo: num formulário longo com seções recolhíveis, um campo não controlado voltava vazio ao reabrir. Com `keepMounted`, a seção fechada continua no DOM, escondida e fora da ordem do Tab, e o que foi digitado fica. Nesse modo ela fecha na hora, sem a animação de recolher. O padrão continua `false`.
