---
"@amfernandesinc/ui": minor
---

**`InputOTP` abre o teclado certo para o `pattern`.** O teclado do celular era sempre numérico, mesmo com um `pattern` que aceita letras: um token de convite como "A7K2Q9" não podia ser digitado. Agora o padrão (só dígitos) abre o teclado numérico e um `pattern` que aceita letras abre o de texto. A nova prop `inputMode` (`"numeric"` ou `"text"`) escolhe o teclado à mão, quando for preciso.
