---
"@amfernandesinc/ui": minor
---

**`FileUpload`: uma parada de Tab a menos, e a dica e o erro passam a ser anunciados.** O `<input type="file">` oculto era uma segunda parada de Tab, de 1×1 px e sem nome; agora ele fica fora da ordem de Tab e da árvore de acessibilidade, e só a dropzone é operada.

A dropzone era nomeada por `aria-label`, que escondia do leitor de tela a dica de tipo e tamanho. Agora ela é nomeada pelo rótulo visível (`aria-labelledby`, inclusive quando o `label` não é texto) e descrita pela dica e pela mensagem de `error` (`aria-describedby`). `labels.dropzoneAriaLabel` ficou sem uso e está marcado como obsoleto.
