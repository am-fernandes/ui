---
"@amfernandesinc/ui": minor
---

**Toast de erro fica até ser fechado, todo toast tem X e os rótulos estão em português.** `toast.error` (e o erro de `toast.promise`) sumia nos 4 segundos do Sonner, muitas vezes antes de ser lido ou de alguém clicar em "Tentar de novo". Agora ele fica até o usuário fechar; os outros tipos continuam saindo em 4s, e um `duration` passado no toast continua valendo.

O `Toaster` passa a mostrar o X em todo toast por padrão (`closeButton={false}` desliga). O X se chama "Fechar notificação" e a região, "Notificações" (eram "Close toast" e "Notifications"). Para trocar os textos use a prop nova `labels` (`{ region, close }`, padrões em `defaultToasterLabels`) ou as do Sonner, `containerAriaLabel` e `toastOptions.closeButtonAriaLabel`.

`toast` agora é exportado pela lib com essa diferença no erro; quem importa `toast` direto de `sonner` não a recebe.
