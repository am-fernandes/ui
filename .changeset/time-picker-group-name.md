---
"@amfernandesinc/ui": minor
---

**`TimePicker`: o grupo é nomeado pelo rótulo.** O grupo recebia um `aria-label` copiado do rótulo: um rótulo que não fosse texto simples virava "Horário", e o "obrigatório" do rótulo ficava de fora. Agora o grupo aponta para o próprio rótulo (`aria-labelledby`); um `aria-label` passado continua valendo, e sem rótulo o nome é "Horário" (`labels.group`).
