---
"@amfernandesinc/ui": minor
---

**`DateInput` ganha `min` e `max`, e `disabledDays` vale também para a data digitada.** `min` e `max` (ISO) desligam os dias fora do intervalo no calendário e param a navegação nos limites. Uma data digitada fora do intervalo, ou num dia que `disabledDays` exclui, não é reportada; ao sair do campo, ele diz o motivo ("A data deve ser a partir de 01/06/2025.", "A data deve ser até 31/12/2025.", "Esta data não está disponível.", textos em `labels`) e reporta `""`.
