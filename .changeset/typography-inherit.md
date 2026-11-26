---
"@amfernandesinc/ui": patch
---

**`Typography` herda a cor do texto em volta.** Ela forçava `text-foreground`: sobre um fundo cheio (botão primário, status, linha selecionada) o texto saía escuro em vez de usar o `-foreground` da superfície. Agora não tem cor própria (só a `caption` continua `muted-foreground`); na página o resultado é o mesmo, porque o `body` já é `foreground`. Ganha também `data-slot="typography"`.
