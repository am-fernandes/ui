---
"@amfernandesinc/ui": patch
---

**Gráficos: SSR sem erro de hidratação.** `BarChart` e `LineChart` mediam o texto de um jeito no servidor e de outro no navegador. Agora a medida real só é usada depois da hidratação.
