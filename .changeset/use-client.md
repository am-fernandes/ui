---
"@amfernandesinc/ui": minor
---

**`"use client"` volta aos arquivos publicados.** O build descartava a diretiva, e num app com React Server Components (Next.js App Router) importar um componente da lib dentro de um Server Component quebrava. Os arquivos que contêm código de cliente voltam a declará-la; os helpers de `lib/*`, o `Breadcrumb`, o `Badge`, o `Skeleton` e a `Typography` continuam utilizáveis no servidor. Os três hooks (`useDebounce`, `useIsMobile`, `useCopyToClipboard`) passam a declarar a diretiva.
