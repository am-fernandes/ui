---
"@amfernandesinc/ui": patch
---

**Esc no `AlertDialog` chama `onCancel`.** O Esc fechava o diálogo sem avisar: `onOpenChange(false)` era chamado, mas `onCancel` só respondia ao botão "Cancelar". Quem limpava estado em `onCancel` (rascunho a descartar, seleção a desfazer) ficava com o fluxo pela metade quando o usuário saía pelo teclado. Agora o Esc conta como "Cancelar", uma vez só.
