---
"@amfernandesinc/ui": patch
---

**Campo desabilitado fica esmaecido por inteiro, rótulo incluído.** Em `Checkbox`, `Switch` e `RadioGroup` desabilitados só a peça de 16px caía a 50%: o rótulo ao lado continuava a 100%, com cara de ativo. Agora o campo todo (controle, rótulo, descrição e erro) fica a 50%, uma vez só, como já acontecia no `Input`. No `RadioGroup`, uma opção desabilitada esmaece a sua linha inteira.

**O rótulo ganha `cursor: pointer`** enquanto o controle está habilitado, já que o clique nele marca a caixa ou foca o campo, e volta ao cursor normal quando o controle está desabilitado.
