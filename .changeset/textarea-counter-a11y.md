---
"@amfernandesinc/ui": minor
---

**`Textarea`: o contador deixa de ser anunciado a cada tecla.** O contador de `maxLength` era uma região viva (`aria-live="polite"`): o leitor de tela lia "27/500", "28/500"… a cada caractere digitado, e não lia nada quando o campo recebia foco.

Agora o contador faz parte da descrição do campo (`aria-describedby`): ao focar, o leitor ouve "27 de 500 caracteres"; ao digitar, nada. Quando o texto chega ao limite, isso é anunciado uma vez ("Limite de 500 caracteres atingido"). Os dois textos são ajustáveis pela nova prop `labels` (`characterCount`, `limitReached`), com os padrões em `defaultTextareaLabels`. Na tela continua "27/500".
