---
"@amfernandesinc/ui": minor
---

**Um `aria-describedby` passado de fora não apaga mais a descrição e o erro do campo.** Em `Input`, `Textarea`, `Checkbox`, `Switch` e `RadioGroup`, a prop `aria-describedby` do consumidor substituía a que o componente monta: com `aria-describedby="dica"`, o leitor de tela deixava de ler a `description` e, pior, a mensagem de `error`.

Agora os ids são somados: primeiro a descrição e o erro do componente, depois os que você passar (pode ser mais de um, separados por espaço).
