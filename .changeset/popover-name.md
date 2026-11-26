---
"@amfernandesinc/ui": patch
---

**`Popover` sempre tem nome.** O conteúdo do `Popover` é um `role="dialog"`, e um diálogo sem nome deixa o leitor de tela anunciar só "diálogo". Agora, sem `aria-label` nem `aria-labelledby`, o popover leva o nome do seu `trigger` (como um menu leva o do botão que o abre); o `id` que o gatilho já tiver é mantido. Sem nome e sem `trigger` (só `anchor`), um aviso em desenvolvimento pede o `aria-label`.
