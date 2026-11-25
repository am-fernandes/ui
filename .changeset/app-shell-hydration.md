---
"@amfernandesinc/ui": patch
---

**`AppShell` hidrata sem erro com o menu salvo.** Em Next.js e Remix, quem tinha expandido (ou recolhido) o menu numa visita anterior fazia o React descartar o HTML do servidor a cada carga ("Hydration failed… this tree will be regenerated on the client"). A escolha salva no localStorage agora é lida depois da hidratação: o servidor e o primeiro render do navegador concordam, e o menu assume o estado salvo logo em seguida. Uma mudança feita em outra aba também passa a valer nesta.
