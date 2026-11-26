---
"@amfernandesinc/ui": patch
---

**`AppShell` monta o `footer` e a navegação uma vez só.** Abaixo de 768px o menu lateral fica escondido, mas continuava montado: o `footer` (e os links do app, pelo `renderLink`) existiam ali e de novo no menu aberto. Um footer que busca a conta, faz polling ou registra atalhos rodava tudo em dobro. Agora, no celular, eles só existem dentro do menu aberto; no desktop, só no menu lateral.

`useIsMobile` passa a acertar desde o primeiro render no navegador (continua `false` no servidor e durante a hidratação), então o que só aparece de um lado do ponto de quebra não monta antes do lado errado.
