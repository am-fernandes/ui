---
"@amfernandesinc/ui": minor
---

**`Textarea`: o contador e o `autoResize` acompanham o valor real do campo.** Antes os dois só enxergavam o `onChange`, então com `register` do react-hook-form o contador ficava em "0/500" mesmo com `defaultValues`, não mudava no `reset()` nem no `setValue()` e não voltava num `form.reset()`. Com `autoResize`, um texto carregado por código ficava cortado, sem barra de rolagem, e estreitar a caixa escondia o fim do texto.

Agora o contador e a altura leem o valor do próprio `<textarea>`: valem para o que o usuário digita, para o que é escrito pelo `ref`, para o reset do formulário e para a mudança de largura da caixa. Nada muda na API.
