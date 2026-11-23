---
"@amfernandesinc/ui": minor
---

**`@amfernandesinc/ui/toggle` passa a existir.** O `Toggle` estava no barrel, mas faltava o subpath no `package.json`: `import { Toggle } from "@amfernandesinc/ui/toggle"` falhava. Agora funciona como os outros componentes.
