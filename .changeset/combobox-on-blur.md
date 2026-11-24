---
"@amfernandesinc/ui": minor
---

**`Combobox` aceita `onBlur`.** Sem ele, o React Hook Form com `mode: "onBlur"` não validava o campo ao sair dele, e `touched` nunca ficava verdadeiro. `onBlur` é chamado quando o foco sai do campo inteiro: abrir a lista e digitar na busca, voltar ao gatilho depois de escolher, ou passar para o botão de limpar e para o × de um item não contam. Passe `onBlur={field.onBlur}` no `Controller`.
