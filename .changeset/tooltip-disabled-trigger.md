---
"@amfernandesinc/ui": patch
---

**`Tooltip` funciona em botão desabilitado.** Um botão `disabled` não recebe eventos de ponteiro nem foco, então o tooltip dele nunca abria: "por que Excluir está desabilitado?" ficava sem resposta. Agora, quando o filho do `Tooltip` está `disabled`, ele é envolvido num `<span>` focável que abre o tooltip no hover e no Tab. Vale também para o `IconButton` desabilitado, que mostra o rótulo.

No celular o tooltip não abre (o toque aciona o controle): diga o motivo também na página.
