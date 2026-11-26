---
"@amfernandesinc/ui": minor
---

**`Schedule`: eventos só leitura não são paradas de Tab, e a grade de horas rola pelo teclado.** Sem `onEventClick` nem `renderEventDetails`, cada evento deixa de ser um botão: o Tab não para mais em dezenas de eventos que não fazem nada, e o leitor de tela continua lendo o nome completo de cada um. Com qualquer um dos dois, os eventos voltam a ser botões. A grade de horas da semana e do dia vira uma região nomeada ("Grade de horários", em `labels.timeGrid`) que recebe foco e rola com as setas e PageDown.
