---
"@amfernandesinc/ui": minor
---

**`MultiInput` ganha `ref`, `name` e `className`, e anuncia o obrigatório.** `ref` aponta para o campo de digitação, então o React Hook Form consegue focá-lo num erro. Com `name`, um input oculto leva a lista para o form nativo separada por vírgula (`"urgente,fiscal"`, `"10,35"`). `className` vai para a caixa que desenha a borda.

Com `required`, o campo de digitação recebe `aria-required` e um form nativo não é enviado com a lista vazia (o navegador mostra o aviso no próprio campo); com pelo menos um item, ele passa.
