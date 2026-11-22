---
"@amfernandesinc/ui": minor
---

**`RadioGroup`: o grupo passa a ter nome acessível.** O `label` era um `<label for>` apontando para o `div[role=radiogroup]`, que não é um controle: o leitor de tela lia as opções sem a pergunta. Agora o grupo aponta para o texto com `aria-labelledby` e o leitor anuncia "Plano, grupo de opções". Sem `label`, passe `aria-label` ou `aria-labelledby`.
