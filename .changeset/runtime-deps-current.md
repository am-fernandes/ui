---
"@amfernandesinc/ui": patch
---

**Dependências mínimas sobem para as versões testadas.** As faixas de `dependencies` (Radix, cmdk, react-day-picker, sonner, tailwind-merge, date-fns e as outras) passam a começar nas versões com que a suíte inteira roda, que são as que um app instala do zero (por exemplo `@radix-ui/react-dialog` `^1.3.1`, `@radix-ui/react-select` `^2.4.1`, `@radix-ui/react-tooltip` `^1.4.1`). Antes, a lib era testada com versões mais antigas que as que os apps recebiam.
