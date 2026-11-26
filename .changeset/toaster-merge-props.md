---
"@amfernandesinc/ui": patch
---

**As props do `Toaster` somam com os padrões da lib.** Antes, passar `toastOptions`, `style`, `icons` ou `className` substituía o objeto inteiro da lib: `<Toaster richColors toastOptions={{ duration: 8000 }} />` perdia a classe que colore o ícone (ele ficava da cor do fundo) e um `style={{ "--width": "420px" }}` apagava a paleta e o z-index. Agora cada uma é mesclada chave por chave: `toastOptions.classNames` soma classe por parte do toast, `style` acrescenta ou troca só as variáveis que você passar, `icons` troca só os ícones que você nomear e `className` soma com a do Toaster.
