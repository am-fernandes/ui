---
"@amfernandesinc/ui": patch
---

**`Select`: um `value` fora das opções vai no `FormData` como está.** Com `name` e um valor que não está na lista (uma opção desativada ou ainda não carregada), o formulário enviava a primeira opção. Agora envia o próprio valor.
