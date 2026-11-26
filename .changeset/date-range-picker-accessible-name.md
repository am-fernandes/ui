---
"@amfernandesinc/ui": minor
---

**`DateRangePicker`: o leitor de tela ouve o período escolhido.** O gatilho recebia um `aria-label` igual ao rótulo, que escondia o período na tela, o "obrigatório" do rótulo e qualquer rótulo que não fosse texto simples (virava "Selecionar período"). Agora o nome do gatilho é o rótulo seguido do período ("Período de vigência obrigatório 01/01/2025 — 31/01/2025"); sem período, é só o rótulo, sem o placeholder. Um `aria-label` passado continua valendo no lugar do rótulo, e sem nenhum dos dois o nome é "Período" (`labels.field`).
