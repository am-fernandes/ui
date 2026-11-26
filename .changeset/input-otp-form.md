---
"@amfernandesinc/ui": minor
---

**`InputOTP` ganha `name`, anuncia o obrigatório e funciona sem `value`.** Com `name`, o form nativo recebe o código digitado. Com `required`, o campo recebe `aria-required` e um form nativo não é enviado com ele vazio. `value` e `onValueChange` passaram a ser opcionais: sem `value`, o campo guarda o próprio código a partir de `defaultValue` e volta a ele quando o formulário é resetado. Quem já passava `value` não precisa mudar nada.
