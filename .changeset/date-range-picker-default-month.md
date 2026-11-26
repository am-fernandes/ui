---
"@amfernandesinc/ui": patch
---

**`DateRangePicker` abre no mês do período salvo.** Com 01–31/01/2025 escolhido, o calendário abria no mês atual, e era preciso voltar mês a mês para ver ou ajustar o período. Agora abre no mês do início do período (ou do fim, se só ele existir); sem período, continua no mês atual.
