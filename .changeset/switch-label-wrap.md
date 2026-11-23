---
"@amfernandesinc/ui": minor
---

**`Switch`: o rótulo quebra em linhas em vez de sair do contêiner.** O rótulo tinha `whitespace-nowrap`: um texto de 411px num espaço de 220px passava por cima do que estivesse ao lado. Agora ele quebra dentro do contêiner, com o switch na altura da primeira linha.

O `Button` continua numa linha só (a altura dele é a do controle). A story `Primitives/Button/Long Label` documenta as duas saídas para um texto maior que o espaço: truncar (`max-w-full` e o texto num `<span className="min-w-0 truncate">`) ou deixar quebrar (`h-auto min-h-control-md py-2 whitespace-normal`).
