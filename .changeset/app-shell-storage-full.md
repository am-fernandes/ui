---
"@amfernandesinc/ui": patch
---

**`AppShell`: recolher e expandir funcionam com o localStorage cheio.** Quando só a gravação falhava (`QuotaExceededError` com o armazenamento cheio, ou o Safari antigo em modo privado), a escolha ia para a memória da página, mas a leitura continuava indo ao localStorage, que devolvia nada ou uma escolha antiga: o botão parecia quebrado, e `onCollapsedChange` avisava um estado que a tela não mostrava. Agora a escolha que não pôde ser salva vale até a página fechar, e uma mudança feita em outra aba volta a valer.
