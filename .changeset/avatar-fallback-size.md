---
"@amfernandesinc/ui": minor
---

**As iniciais do `Avatar` acompanham o tamanho.** O fallback tinha `text-sm` fixo: num avatar `size-6` as iniciais vazavam do círculo e num `size-16` ficavam miúdas. Agora medem 35% da largura do avatar (14px no padrão de 40px, como antes).

A documentação de `allowedProtocols` foi corrigida: a lista substitui a padrão, então para aceitar `data:` além de https passe `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "data:"]`. `["data:"]` sozinho bloqueia as fotos https.
