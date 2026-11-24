---
"@amfernandesinc/ui": minor
---

**`Stepper`: `keepMounted` e `id` nas etapas.** Na vertical só o `content` da etapa atual era montado: ao voltar, os campos não controlados da etapa anterior estavam vazios. Com `keepMounted`, o conteúdo de todas as etapas fica no DOM, escondido fora da etapa atual. As etapas aceitam `id`, para manter cada uma no lugar quando etapas entram ou saem em tempo de execução (uma etapa "Cônjuge", por exemplo). `activeStep` continua a partir de 0.
