---
"@amfernandesinc/ui": patch
---

**`AlertDialog`: um clique duplo confirma uma vez só.** Enquanto o diálogo fechava (175ms de animação), os botões continuavam montados e clicáveis: um segundo clique, ou o Enter segurado, chamava `onConfirm` de novo e "Aprovar proposta" ou "Excluir" disparava duas requisições. Agora "Confirmar" e "Cancelar" só respondem com o diálogo aberto.

Um `AlertDialog` controlado que o consumidor mantém aberto (`open` continua `true` depois do `onConfirm`) segue aceitando cada clique.
