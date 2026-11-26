---
"@amfernandesinc/ui": minor
---

**Azul funcional.** Link, foco e "onde estou" ganham uma cor só deles, o marinho-500 (marinho-300 no escuro); a primária continua nos preenchimentos.

- **Foco:** o anel dos controles e a borda e o anel interno dos campos (`field-states`) usam `--ring`, o azul funcional.
- **Botão principal:** hover e pressed trocam de tom (`--primary-hover`, `--primary-pressed`) em vez de usar a camada de 5%, que mal aparecia sobre o marinho-950. Vale também para o `IconButton` primário.
- **Botão `link`:** usa `--link`.
- **AppShell:** o item inativo do menu recua para `--muted-foreground`; o ativo usa `--accent`, peso maior e um marcador de 3px no azul funcional. O fundo do item ativo fica mais forte que o do hover.
- **Checkbox, Radio e o indicador do Combobox múltiplo:** desmarcados usam a borda `--input`; marcados continuam na primária.
- **DataTable:** a linha selecionada usa `--accent`.
