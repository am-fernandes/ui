---
"@amfernandesinc/ui": patch
---

**`Alert` só interrompe o leitor de tela quando precisa.** Toda variante era `role="alert"`, então um aviso de `info` ou `success` inserido na página cortava o que o leitor de tela estava lendo, como um erro faria. Agora `destructive` e `warning` continuam `role="alert"`, e `default`, `info` e `success` passam a `role="status"`, lidos quando o leitor fica livre. Para forçar outro papel, passe `role`.

Se seus testes procuravam um `Alert` informativo com `getByRole("alert")`, troque para `getByRole("status")`.
