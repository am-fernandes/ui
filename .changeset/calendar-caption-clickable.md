---
"@amfernandesinc/ui": patch
---

Calendar: fix the quick-nav caption not opening on a real mouse click. The
react-day-picker nav (prev/next arrows) is absolutely positioned full-width over
the caption row, and its empty middle was intercepting clicks meant for the
interactive caption ("julho 2026") — so the year/month panel only opened via
keyboard/programmatic clicks, not a normal mouse click. The nav container now
passes pointer events through (`pointer-events-none`) while the arrow buttons
keep them (`pointer-events-auto`).
