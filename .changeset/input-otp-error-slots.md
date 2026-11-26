---
"@amfernandesinc/ui": patch
---

**`InputOTP` com `error` marca as caixas do código.** Com erro, só a mensagem embaixo mudava: as caixas tinham a mesma borda de um campo válido, diferente dos outros campos da biblioteca. Agora cada caixa fica com a borda vermelha do erro (e `data-invalid`), inclusive a que está com o foco.
