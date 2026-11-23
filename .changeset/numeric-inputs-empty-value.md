---
"@amfernandesinc/ui": minor
---

**`CurrencyInput` e `PercentageInput` sabem ficar vazios e funcionam sem `value`.** Os dois só tinham `value: number`: limpar o campo voltava a `0,00`, o `required` nativo nunca falhava e "não informado" era igual a zero.

A nova prop `emptyValue` decide o que vale um campo vazio. O padrão, `"zero"`, é o comportamento de sempre. Com `emptyValue="null"`, `value` aceita `null`, limpar o campo reporta `null`, o placeholder aparece (por padrão, `0,00`) e `onValueChange` passa a ser `(value: number | null) => void`; zero digitado continua sendo um valor.

```tsx
const [entrada, setEntrada] = useState<number | null>(null)
<CurrencyInput label="Entrada" emptyValue="null" value={entrada} onValueChange={setEntrada} />
```

Sem `value`, os dois campos são **não controlados**: partem de `defaultValue`, guardam o que é digitado e voltam ao `defaultValue` no reset do formulário. `value` e `onValueChange` passaram a ser opcionais.
