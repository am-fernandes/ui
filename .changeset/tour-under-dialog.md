---
"@amfernandesinc/ui": minor
---

**Um `Dialog` aberto durante o `Tour` fica por cima do balão.** O tour não é modal, então o alvo da etapa continua clicável, e muitas vezes ele abre um `Dialog` ("Nova proposta"). O balão ficava na camada dos popovers, acima de todo modal: aparecia por cima do diálogo, sem responder a nada. Agora o diálogo cobre e escurece o balão até ser fechado, e o Esc fecha o diálogo antes do tour.
