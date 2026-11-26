---
"@amfernandesinc/ui": minor
---

**`Button` nasce com `type="button"` (mudança que quebra).** Sem `type`, todo `<Button>` dentro de um `<form>` era um botão de envio: um "Cancelar" ou "Adicionar item" com `onClick` enviava o formulário junto. Agora o padrão é `type="button"`, igual ao `IconButton`.

**Como migrar:** no botão que envia o formulário, passe `type="submit"` (`<Button type="submit">Salvar</Button>`). Botões que já tinham `type` e botões fora de formulário não mudam. Com `asChild` nenhum `type` é aplicado ao filho.
