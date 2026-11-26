---
"@amfernandesinc/ui": minor
---

**O `styles` declara o `@source` da lib: o app não precisa mais da linha.** O Tailwind v4 não lê `node_modules`, e sem um `@source "../node_modules/@amfernandesinc/ui/dist"` no CSS do app as classes usadas só dentro dos componentes não eram geradas (num app novo, 30 KB de CSS em vez de 128 KB): Dialog, Popover e Select abriam sem estilo. O README nem mencionava a linha. Agora o `tokens.css` publicado traz `@source "./"`, relativo a ele mesmo na `dist/`, e os dois imports bastam. Quem já tem a linha pode tirá-la ou deixá-la (o resultado é o mesmo).
