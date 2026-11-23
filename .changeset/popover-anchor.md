---
"@amfernandesinc/ui": minor
---

**`Popover` ganha `anchor`.** `trigger` é opcional, mas sem ele o popover não tinha para onde apontar: abria acima da tela, fora de vista, e ainda levava o foco. Quando outra coisa abre o popover (um botão em outro lugar, um atalho), passe em `anchor` o elemento para onde ele aponta e abra com `open`:

```tsx
<Popover open={open} onOpenChange={setOpen} anchor={<span>Unidade 101</span>} aria-label="Detalhes">
  …
</Popover>
```

Em desenvolvimento, um `Popover` sem `trigger` nem `anchor` avisa no console.
