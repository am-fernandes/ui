---
"@amfernandesinc/ui": patch
---

**`Calendar`: as setas voltam a mover o foco entre os dias.** Com o foco num dia, seta, Home, End, PageUp e PageDown não faziam nada (ou jogavam o foco para o `<body>` ao trocar de mês), e só o dia selecionado ou o de hoje era alcançável pelo teclado. Agora o foco anda como o `react-day-picker` define: setas por dia e semana, Home e End para o começo e o fim da semana, PageUp e PageDown para o mês anterior e o seguinte. Vale também para o calendário do `DateInput` e do `DateRangePicker`.
