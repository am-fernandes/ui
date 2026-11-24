---
"@amfernandesinc/ui": minor
---

**`Calendar` volta a anunciar o mês ao trocar.** A legenda clicável (que abre a escolha rápida de ano e mês) tinha descartado a região viva do `react-day-picker`, e o leitor de tela não dizia nada ao passar para o mês seguinte. Uma região viva escondida ao lado da legenda anuncia o novo mês ("julho 2025").
