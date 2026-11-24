---
"@amfernandesinc/ui": minor
---

**`CommandPalette` fecha ao escolher um item.** Depois do `onSelect`, a paleta chama `onOpenChange(false)`; não é mais preciso fechar à mão em cada item, e no celular, onde não há Esc, escolher um item já tira a paleta da frente. Passe `closeOnSelect={false}` para uma paleta que fica aberta entre comandos. Um clique ou toque fora dela também fecha.
