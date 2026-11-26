---
"@amfernandesinc/ui": patch
---

**`InputOTP` desabilitado esmaece uma vez só.** As caixas do código ficavam a 25% de opacidade, porque o contêiner aplicava `opacity-50` por cima do `opacity-50` que o campo inteiro já recebe; ficavam bem mais apagadas que o rótulo e que os outros campos desabilitados. Agora o campo inteiro, rótulo e caixas, fica a 50%, como os demais.
