---
"@amfernandesinc/ui": minor
---

**`MultiInput` funciona sem `value`.** O campo só funcionava controlado: sem `value` ele quebrava, e num form nativo era preciso guardar um estado só para ele existir. Agora `value` e `onValueChange` são opcionais; sem `value`, o campo guarda a própria lista a partir de `defaultValue` e volta a ela quando o form é resetado. Com `name`, o form nativo recebe a lista do mesmo jeito. Quem já passava `value` não precisa mudar nada.
