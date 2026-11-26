---
"@amfernandesinc/ui": patch
---

**Campos mascarados: colar num campo cheio não corta mais o final.** Colar um trecho no meio de um CPF, CNPJ, CEP ou telefone já completo empurrava os últimos dígitos para fora, sem aviso. A colagem agora é recusada, como a digitação já era.
