---
"@amfernandesinc/ui": minor
---

**`AppShell`: menu recolhido controlável.** `collapsed` + `onCollapsedChange` deixam o estado com o app (persistir por usuário no backend, recolher num quadro em tela cheia); `onCollapsedChange` também avisa no modo não controlado. `storageKey` troca a chave do localStorage (padrão `"amf-ui:sidebar:collapsed"`), e `storageKey={false}` não lê nem grava nada. `useAppShell()` ganha `toggle`, para ligar um atalho de teclado.
