---
"@amfernandesinc/ui": patch
---

**`TimePicker`: digitar "9:30" dá 09:30.** O `:` depois de um dígito era ignorado: o "3" entrava na hora ("93") e, ao sair, o campo apagava tudo. Agora o `:` completa a hora com zero à esquerda e passa para os minutos (no campo dos minutos ele é ignorado). Uma hora ou um minuto inválido é limpo ao sair sem levar o outro campo junto: antes, uma hora inválida apagava também os minutos.
