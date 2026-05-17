# @am-fernandes/ui

Design system de UI da AM Fernandes — componentes React, tokens Tailwind v4 e documentação Storybook.

Spec: [`docs/superpowers/specs/2026-05-16-am-fernandes-ui-design.md`](./docs/superpowers/specs/2026-05-16-am-fernandes-ui-design.md)

## Setup

```bash
bun install
bun run storybook       # http://localhost:6006
bun run build           # gera dist/ (package publicável)
bun run build-storybook # gera storybook-static/
```

## Consumo

```css
/* index.css da sua app */
@import "@am-fernandes/ui/fonts";
@import "@am-fernandes/ui/styles";
```

```ts
import { cn } from "@am-fernandes/ui";
```

## Status

Em construção. Fase 1 (foundations) — sem componentes ainda.
