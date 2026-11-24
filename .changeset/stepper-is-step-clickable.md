---
"@amfernandesinc/ui": minor
---

**`Stepper` ganha `isStepClickable`.** Com `onStepClick`, toda etapa virava botão, inclusive as futuras; para o assistente comum (voltar sim, pular não) era preciso marcá-las `disabled`, e elas ficavam esmaecidas como se fossem proibidas. Agora `isStepClickable={(i) => i < activeStep}` faz só as etapas escolhidas virarem botões; as outras aparecem normais. As setas do modo compacto seguem a mesma regra (e ficam `aria-disabled` nas pontas, sem perder o foco).
