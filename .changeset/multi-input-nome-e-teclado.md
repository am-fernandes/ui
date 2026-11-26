---
"@amfernandesinc/ui": minor
---

**`MultiInput` é anunciado pelo rótulo e os itens saem pelo teclado.** O campo de texto era nomeado pelo `placeholder` e o grupo por "Lista de itens": quem usa leitor de tela nunca ouvia o `label`. Agora os dois são nomeados pelo rótulo visível. Sem `label`, use a nova prop `aria-label`; o `placeholder` fica como último recurso.

O botão de remover de cada item recebia foco, mas só reagia ao mouse. Enter, Espaço, Delete e Backspace agora removem o item, e o foco segue para o item vizinho (ou volta ao campo de texto quando a lista esvazia), em vez de se perder na página. O clique no × continua sem tirar o foco do campo nem confirmar o texto em digitação.
