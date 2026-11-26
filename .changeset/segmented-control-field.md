---
"@amfernandesinc/ui": minor
---

**`SegmentedControl` vira um campo de formulário completo.** A API era fechada: não aceitava `id`, `aria-describedby`, `aria-labelledby`, `onBlur` nem `data-testid`, e o `label` nunca aparecia, então um formulário escrevia o rótulo à mão com `aria-hidden`. Agora:

- os atributos de um `<div>` (`id`, `aria-*`, `data-*`, handlers como `onBlur`) vão para o grupo;
- `labelPosition` (`"hidden"`, o padrão de sempre, `"up"` ou `"left"`) desenha o rótulo, que passa a nomear o grupo;
- `description` e `error` aparecem abaixo e descrevem o grupo (`aria-describedby`, e `aria-invalid` com erro);
- `fieldClassName` estiliza o campo em volta.

Sem rótulo visível nem mensagens, o campo em volta não ocupa caixa (`display: contents`): o controle numa barra de ferramentas fica exatamente como antes.
