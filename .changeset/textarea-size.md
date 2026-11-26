---
"@amfernandesinc/ui": minor
---

**`Textarea` ganha `size`.** `size="sm" | "md" | "lg"` define a altura mínima e o padding pelos tokens de altura de controle. Com `rows={1}` a caixa mede 32, 40 ou 44px, a altura de um `Input` do mesmo tamanho, e o texto fica na mesma linha de um campo ao lado: serve para um campo de mensagem com o botão de enviar na mesma linha.

A altura mínima deixa de ser fixa em 60px: o padrão de duas linhas mede 60px (eram 62px) e um `rows={1}` agora mede 40px.
