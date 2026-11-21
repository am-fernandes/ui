---
"@amfernandesinc/ui": minor
---

**Durações e curvas do Astryx.** Novos tokens `--duration-{fast,medium,slow}` (175/410/975ms), cada um com `-min` e `-max`, mais `--duration-exit`, e as curvas `--ease-standard` (entrada, desacelera) e `--ease-exit` (saída, acelera).

- Tooltip e DropdownMenu entram em 175ms; Popover e Tour em 310ms; Sheet e o menu mobile do AppShell em 410ms; Dialog e AlertDialog em 550ms. Toda saída leva 175ms.
- Accordion, Collapsible e as transições de hover (`transition*`) usam 175ms com a curva padrão.
- `--motion-fast`, `--motion-default`, `--motion-slow` e `--motion-slowest` continuam por uma versão, apontando para o token novo de cada papel, e estão deprecated.
