---
"@amfernandesinc/ui": patch
---

**`RadioGroup`: `required` deixa de ser só o asterisco.** A prop não chegava ao grupo: `aria-required` ficava `"false"` e o formulário era enviado sem nenhuma opção marcada. Agora o grupo é anunciado como obrigatório e, com `name`, a validação nativa do formulário barra o envio até uma opção ser escolhida.
