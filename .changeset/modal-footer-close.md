---
"@amfernandesinc/ui": minor
---

**`footer` de `Dialog` e `Sheet` aceita uma função que recebe `close`.** Um modal não controlado não tinha como fechar pelo rodapé: o "Cancelar" não fazia nada, a menos que você controlasse `open` só para isso. Agora:

```tsx
<Dialog
  trigger={<Button>Editar proposta</Button>}
  title="Editar proposta"
  footer={({ close }) => (
    <>
      <Button variant="outline" onClick={close}>Cancelar</Button>
      <Button type="submit" form="proposta">Salvar</Button>
    </>
  )}
>
```

`close` fecha como o X: chama `onOpenChange(false)` e devolve o foco. Um `footer` comum (nó React) continua funcionando como antes.
