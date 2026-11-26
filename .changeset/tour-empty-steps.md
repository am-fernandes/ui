---
"@amfernandesinc/ui": patch
---

**`Tour`: a lista de passos pode esvaziar com o tour aberto.** Passado o primeiro passo, `steps={[]}` derrubava a tela com `TypeError`. Agora o balão só some.
