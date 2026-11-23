---
"@amfernandesinc/ui": minor
---

**`MultiInput` desabilitado anuncia o grupo como desabilitado.** Os itens de um campo desabilitado ficavam esmaecidos sem nada dizer que o grupo estava inativo: o leitor de tela lia os itens como se pudessem ser editados. O grupo agora recebe `aria-disabled="true"` enquanto `disabled`.
