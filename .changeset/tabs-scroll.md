---
"@amfernandesinc/ui": patch
---

**`Tabs`: a lista de abas rola quando não cabe.** A lista era `inline-flex` com rótulos que não quebram: três abas curtas num contêiner de 240px vazavam para 266px, e a ficha de um lead com 8 abas estourava a tela do celular. Agora a lista fica do tamanho do contêiner e rola de lado, e a aba ativa (por clique ou pelas setas, Home e End) é rolada para a vista, sem rolar a página. O anel de foco das abas passa a ser interno, para a rolagem não cortá-lo.
