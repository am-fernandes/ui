---
"@amfernandesinc/ui": minor
---

**`CPFInput`, `CNPJInput`, `CEPInput` e `PhoneInput` funcionam sem `value` e não quebram com valor nulo.** `value={null}` ou `value={undefined}` (o que o react-hook-form entrega antes do `defaultValues`) lançava `Cannot read properties of null (reading 'replace')`. Agora `null` é campo vazio.

Sem `value`, o campo é **não controlado**: parte de `defaultValue`, guarda o que é digitado e continua chamando `onValueChange`, que passou a ser opcional. Num `<form>` nativo, `<CPFInput name="cpf" defaultValue="52998224725" />` basta, e o reset do formulário devolve o `defaultValue`.
