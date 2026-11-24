---
"@amfernandesinc/ui": minor
---

**`DateInput` é digitável.** O campo era um botão: só dava para escolher a data no calendário, e uma data de nascimento pedia gatilho, legenda, ano, mês e dia. Agora é um campo de texto com máscara `dd/mm/aaaa` (as barras entram sozinhas, o cursor fica onde estava ao editar no meio, colar `15/03/1990` ou `1990-03-15` preenche) e um botão "Abrir calendário" no fim. O valor continua a string ISO `yyyy-MM-dd`: enquanto o texto está incompleto nada é reportado; uma data inteira e válida reporta o ISO; ao sair do campo com uma data incompleta ou que não existe (`31/02/2026`), o campo mostra "Data inválida" (texto em `labels.invalidDate`, a menos que você passe `error`) e reporta `""`. O calendário abre com o foco no dia escolhido, e Enter nele mantém a data em vez de apagá-la. O nome acessível vem do `label` e o leitor de tela lê o valor do campo.

**Migração.** `ref` agora aponta para o `<input>` de texto, não para o botão: troque `useRef<HTMLButtonElement>` por `useRef<HTMLInputElement>`. Testes que procuravam o campo como `getByRole("button", { name: "Data…" })` passam a usar `getByRole("textbox", { name: "Data…" })`; o botão do calendário se chama "Abrir calendário" (`labels.openCalendar`).
