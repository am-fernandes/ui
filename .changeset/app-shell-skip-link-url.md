---
"@amfernandesinc/ui": patch
---

**`AppShell`: "Pular para o conteúdo" não muda a URL.** O link era um `href="#conteudo"` comum. Num app com hash router (`HashRouter`, `createHashHistory`, comum em Electron), mudar o hash é navegar: o link abria uma página "não encontrada". Nos outros, deixava `#conteudo` no endereço e um passo a mais no "voltar". Agora ele leva o foco ao conteúdo sem tocar na URL; o `href` continua para página sem JavaScript.
