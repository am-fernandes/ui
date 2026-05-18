# `@am-fernandes/ui` — Phase 1: Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `@am-fernandes/ui` repo with Bun + Vite + Storybook 10 + Tailwind v4, ship the full token system (light-only) and six foundations MDX pages. Result: `bun run storybook` opens a working Storybook showing brand foundations, no components yet. Package builds clean and is publishable as `0.0.1`.

**Architecture:** ESM-only package consumed via `@am-fernandes/ui` (barrel from `dist/index.js`) + `@am-fernandes/ui/styles` (raw `tokens.css`) + `@am-fernandes/ui/fonts` (Google Sans Flex). Storybook 10 docs site is the contract surface. tsup bundles the JS; CSS is copied as-is to `dist/`.

**Tech Stack:** Bun, TypeScript 5, React 19, Tailwind v4, Storybook 10 (`@storybook/react-vite`), tsup, Biome.

**Spec reference:** `docs/superpowers/specs/2026-05-16-am-fernandes-ui-design.md`

**Scope of this plan:** Phase 1 only (foundations). Components (Phases 2–7) and migration (Phase 8) get their own plans.

**Notes:**
- The spec explicitly opts out of unit tests for this project. "Verify" steps below mean: run the command, eyeball Storybook in the browser, confirm the success criterion. No `bun test` invocations.
- Repo root: `/home/matheus/Projects/ui`. Current state: empty `.git` (no commits yet — first commit happens in this plan).
- The spec's design doc already lives at `docs/superpowers/specs/2026-05-16-am-fernandes-ui-design.md` and was committed before this plan. Don't re-add it.

---

## File Structure (created in this phase)

```
ui/
├── .gitignore
├── .npmrc                            # GitHub Packages auth pointer (token in env)
├── biome.json
├── bun-env.d.ts
├── package.json
├── tsconfig.json                     # for source
├── tsconfig.build.json               # for tsup (no JSX preserve, decl on)
├── tsup.config.ts
├── README.md
├── .storybook/
│   ├── main.ts                       # defineMain({ framework: "@storybook/react-vite" })
│   ├── preview.tsx                   # imports tokens.css + fonts.css; font decorator
│   ├── manager.ts                    # branded Storybook UI theme
│   └── vite.config.ts                # Vite config consumed by SB (Tailwind v4 plugin)
├── src/
│   ├── index.ts                      # barrel — exports cn() only in this phase
│   ├── lib/
│   │   └── utils.ts                  # cn() helper (clsx + tailwind-merge)
│   ├── styles/
│   │   ├── tokens.css                # @theme inline + :root (light only)
│   │   └── fonts.css                 # @import Google Sans Flex
│   └── docs/                         # MDX foundations pages
│       ├── GettingStarted.mdx
│       ├── Colors.mdx
│       ├── Typography.mdx
│       ├── Spacing.mdx
│       ├── Radius.mdx
│       └── Iconography.mdx
└── docs/superpowers/                 # already exists (spec, plans)
```

---

## Task 1: Initialize repo metadata

**Files:**
- Create: `.gitignore`
- Create: `bun-env.d.ts`
- Create: `README.md`

- [ ] **Step 1: Write `.gitignore`**

Create `/home/matheus/Projects/ui/.gitignore`:

```gitignore
node_modules/
dist/
storybook-static/
.DS_Store
*.log
.env
.env.local
```

Note: `bun.lock` is intentionally tracked (not ignored) so Storybook/tsup versions are reproducible across contributors.

- [ ] **Step 2: Write `bun-env.d.ts`**

Create `/home/matheus/Projects/ui/bun-env.d.ts`:

```ts
/// <reference types="bun-types" />
```

- [ ] **Step 3: Write `README.md`**

Create `/home/matheus/Projects/ui/README.md`:

```markdown
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
```

- [ ] **Step 4: Commit**

```bash
cd /home/matheus/Projects/ui
git add .gitignore bun-env.d.ts README.md
git commit -m "chore: init repo metadata"
```

---

## Task 2: Scaffold `package.json`

**Files:**
- Create: `package.json`

- [ ] **Step 1: Write `package.json`**

Create `/home/matheus/Projects/ui/package.json`:

```json
{
  "name": "@am-fernandes/ui",
  "version": "0.0.1",
  "description": "Design system de UI da AM Fernandes.",
  "license": "UNLICENSED",
  "private": false,
  "type": "module",
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles": "./dist/tokens.css",
    "./fonts": "./dist/fonts.css"
  },
  "scripts": {
    "build": "tsup && bun run build:styles",
    "build:styles": "cp src/styles/tokens.css dist/tokens.css && cp src/styles/fonts.css dist/fonts.css",
    "dev": "tsup --watch",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "typecheck": "tsc --noEmit",
    "lint": "biome check ."
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "@storybook/addon-a11y": "^10.2.9",
    "@storybook/addon-docs": "^10.2.9",
    "@storybook/addon-themes": "^10.2.9",
    "@storybook/react-vite": "^10.2.9",
    "@tailwindcss/vite": "^4.2.1",
    "@types/bun": "latest",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^6.0.1",
    "react": "^19",
    "react-dom": "^19",
    "storybook": "^10.2.9",
    "tailwindcss": "^4.1.11",
    "tsup": "^8.3.5",
    "typescript": "^5.9.3",
    "vite": "^8.0.0"
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19",
    "tailwindcss": "^4"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "git+ssh://git@github.com/am-fernandes/ui.git"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd /home/matheus/Projects/ui
bun install
```

Expected: `node_modules/` populated, `bun.lock` created, no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add package.json and install deps"
```

---

## Task 3: TypeScript and Biome configs

**Files:**
- Create: `tsconfig.json`
- Create: `tsconfig.build.json`
- Create: `biome.json`

- [ ] **Step 1: Write `tsconfig.json`**

Create `/home/matheus/Projects/ui/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "moduleDetection": "force",
    "jsx": "preserve",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", ".storybook", "bun-env.d.ts"]
}
```

- [ ] **Step 2: Write `tsconfig.build.json`**

Create `/home/matheus/Projects/ui/tsconfig.build.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "noEmit": false,
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["src/**/*.stories.tsx", "src/**/*.mdx", "src/docs"]
}
```

- [ ] **Step 3: Write `biome.json`**

Create `/home/matheus/Projects/ui/biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": {
    "ignore": ["dist", "storybook-static", "node_modules"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": { "noNonNullAssertion": "off" },
      "suspicious": { "noExplicitAny": "warn" }
    }
  },
  "javascript": {
    "formatter": { "quoteStyle": "double", "semicolons": "asNeeded" }
  }
}
```

- [ ] **Step 4: Verify typecheck runs (will pass — no source yet)**

```bash
cd /home/matheus/Projects/ui
bun run typecheck
```

Expected: exits 0, no output.

- [ ] **Step 5: Verify Biome runs**

```bash
bun run lint
```

Expected: exits 0, "Checked 0 files" or similar (no source yet).

- [ ] **Step 6: Commit**

```bash
git add tsconfig.json tsconfig.build.json biome.json
git commit -m "chore: add TypeScript and Biome configs"
```

---

## Task 4: Tokens CSS (light only)

**Files:**
- Create: `src/styles/tokens.css`

- [ ] **Step 1: Write `src/styles/tokens.css`**

Create `/home/matheus/Projects/ui/src/styles/tokens.css` with the full contents below. Source: adapted from `requerimento-contratos-pf/src/styles/globals.css`, with the `.dark { ... }` block removed.

Note: `@import "tw-animate-css"` from the original is intentionally **not** included in Phase 1 — it's only needed when overlay/animation components ship (Phase 3). Adding it now would force every consumer (and Storybook) to install a plugin we don't yet use.

```css
@import "tailwindcss";

@theme inline {
  --font-sans: "Google Sans Flex", sans-serif;

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);

  /* Status badge palettes — tinted bg, WCAG AA text, medium border */
  --color-status-success-bg: var(--status-success-bg);
  --color-status-success-text: var(--status-success-text);
  --color-status-success-border: var(--status-success-border);
  --color-status-warning-bg: var(--status-warning-bg);
  --color-status-warning-text: var(--status-warning-text);
  --color-status-warning-border: var(--status-warning-border);
  --color-status-info-bg: var(--status-info-bg);
  --color-status-info-text: var(--status-info-text);
  --color-status-info-border: var(--status-info-border);
  --color-status-destructive-bg: var(--status-destructive-bg);
  --color-status-destructive-text: var(--status-destructive-text);
  --color-status-destructive-border: var(--status-destructive-border);

  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  --radius: 0.5rem;

  /* Backgrounds & Foregrounds */
  --background: oklch(1 0 0);
  --foreground: oklch(0.203 0.013 252);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.203 0.013 252);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.203 0.013 252);

  /* Primary: preto 100% */
  --primary: oklch(0 0 0);
  --primary-foreground: oklch(1 0 0);

  /* Secondary: branco */
  --secondary: oklch(1 0 0);
  --secondary-foreground: oklch(0 0 0);

  /* Muted & Accent */
  --muted: oklch(0.934 0.008 252);
  --muted-foreground: oklch(0.185 0 0);
  --accent: oklch(0.968 0.005 252);
  --accent-foreground: oklch(0.203 0.013 252);

  /* Destructive: vermelho puro #ff0000 (0 100% 50%) */
  --destructive: oklch(0.628 0.258 29.2);
  --destructive-foreground: oklch(1 0 0);

  /* Success: verde #6d8d0b (74 85% 30%) */
  --success: oklch(0.497 0.135 120.7);
  --success-foreground: oklch(1 0 0);

  /* Warning: amarelo #ebcd17 (49 86% 51%) */
  --warning: oklch(0.868 0.167 92.6);
  --warning-foreground: oklch(0 0 0);

  /* Info: azul claro #03a9f4 (199 98% 48%) */
  --info: oklch(0.668 0.151 236.3);
  --info-foreground: oklch(1 0 0);

  /* Status badge palettes — tinted bg, WCAG AA contrast text, medium border */
  --status-success-bg: oklch(0.96 0.025 120.7);
  --status-success-text: oklch(0.33 0.07 120.7);
  --status-success-border: oklch(0.68 0.1 120.7);
  --status-warning-bg: oklch(0.97 0.03 92.6);
  --status-warning-text: oklch(0.38 0.1 92.6);
  --status-warning-border: oklch(0.75 0.12 92.6);
  --status-info-bg: oklch(0.96 0.02 236.3);
  --status-info-text: oklch(0.35 0.1 236.3);
  --status-info-border: oklch(0.6 0.12 236.3);
  --status-destructive-bg: oklch(0.97 0.02 29.2);
  --status-destructive-text: oklch(0.42 0.18 29.2);
  --status-destructive-border: oklch(0.6 0.2 29.2);

  /* Inputs & Borders */
  --border: oklch(0.875 0.01 252);
  --input: oklch(0.875 0.01 252);
  --placeholder: oklch(0.638 0.016 252);
  --ring: oklch(0 0 0);

  /* Charts */
  --chart-1: oklch(0 0 0);
  --chart-2: oklch(0.507 0.189 17.6);
  --chart-3: oklch(0.497 0.135 120.7);
  --chart-4: oklch(0.868 0.167 92.6);
  --chart-5: oklch(0.668 0.151 236.3);

  /* Sidebar */
  --sidebar: oklch(1 0 0);
  --sidebar-foreground: oklch(0.203 0.013 252);
  --sidebar-primary: oklch(0 0 0);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.968 0.005 252);
  --sidebar-accent-foreground: oklch(0.203 0.013 252);
  --sidebar-border: oklch(0.875 0.01 252);
  --sidebar-ring: oklch(0 0 0);
}

@layer base {
  * {
    border-color: var(--color-border);
  }
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
  }
  input::placeholder,
  textarea::placeholder {
    color: var(--placeholder);
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    appearance: textfield;
    -moz-appearance: textfield;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat(tokens): add light-only token system from requerimento brand"
```

---

## Task 5: Fonts CSS

**Files:**
- Create: `src/styles/fonts.css`

- [ ] **Step 1: Write `src/styles/fonts.css`**

Create `/home/matheus/Projects/ui/src/styles/fonts.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap");
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/fonts.css
git commit -m "feat(fonts): add Google Sans Flex import"
```

---

## Task 6: `lib/utils.cn` helper

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/index.ts`

- [ ] **Step 1: Write `src/lib/utils.ts`**

Create `/home/matheus/Projects/ui/src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Write `src/index.ts` barrel**

Create `/home/matheus/Projects/ui/src/index.ts`:

```ts
export { cn } from "./lib/utils"
```

- [ ] **Step 3: Verify typecheck**

```bash
cd /home/matheus/Projects/ui
bun run typecheck
```

Expected: exits 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils.ts src/index.ts
git commit -m "feat(lib): add cn() helper and barrel"
```

---

## Task 7: tsup config + first package build

**Files:**
- Create: `tsup.config.ts`

- [ ] **Step 1: Write `tsup.config.ts`**

Create `/home/matheus/Projects/ui/tsup.config.ts`:

```ts
import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: { compilerOptions: { jsx: "react-jsx" } },
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom"],
  tsconfig: "./tsconfig.build.json",
})
```

- [ ] **Step 2: Run the build**

```bash
cd /home/matheus/Projects/ui
bun run build
```

Expected: `dist/index.js`, `dist/index.d.ts`, `dist/tokens.css`, `dist/fonts.css` exist. No errors.

- [ ] **Step 3: Verify dist contents**

```bash
ls -la dist/
```

Expected output contains: `index.js`, `index.js.map`, `index.d.ts`, `tokens.css`, `fonts.css`.

- [ ] **Step 4: Commit**

```bash
git add tsup.config.ts
git commit -m "build: configure tsup and verify package builds"
```

---

## Task 8: Install Storybook 10

**Files:**
- Modify: `package.json` (Storybook init may add entries — verify they match deps already declared)
- Create: `.storybook/main.ts`
- Create: `.storybook/preview.tsx`
- Create: `.storybook/vite.config.ts`

Storybook's `npx storybook init` is interactive and adds default boilerplate. We've already pinned the Storybook deps in `package.json`, so write the config files directly instead of running init.

- [ ] **Step 1: Write `.storybook/vite.config.ts`**

This config is consumed by Storybook's Vite builder. We add the Tailwind v4 plugin so MDX/stories can use `@import "tailwindcss"`.

Create `/home/matheus/Projects/ui/.storybook/vite.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 2: Write `.storybook/main.ts`**

Create `/home/matheus/Projects/ui/.storybook/main.ts`:

```ts
import { defineMain } from "@storybook/react-vite/node"

export default defineMain({
  framework: "@storybook/react-vite",
  stories: [
    "../src/docs/**/*.mdx",
    "../src/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
  ],
  docs: { autodocs: "tag" },
  typescript: { reactDocgen: "react-docgen-typescript" },
})
```

- [ ] **Step 3: Write `.storybook/preview.tsx`**

Create `/home/matheus/Projects/ui/.storybook/preview.tsx`:

```tsx
import type { Preview } from "@storybook/react-vite"
import { withThemeByClassName } from "@storybook/addon-themes"

import "../src/styles/fonts.css"
import "../src/styles/tokens.css"

const preview: Preview = {
  parameters: {
    backgrounds: { default: "background" },
    options: {
      storySort: {
        order: [
          "Getting Started",
          "Foundations",
          ["Colors", "Typography", "Spacing", "Radius", "Iconography"],
        ],
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: "" },
      defaultTheme: "light",
    }),
    (Story) => (
      <div className="font-sans text-foreground bg-background p-6">
        <Story />
      </div>
    ),
  ],
}

export default preview
```

- [ ] **Step 4: Run Storybook**

```bash
cd /home/matheus/Projects/ui
bun run storybook
```

Expected: Storybook builds and serves on `http://localhost:6006`. Sidebar is empty (no stories or MDX yet) but the shell loads. No errors in terminal or browser console.

Stop Storybook (Ctrl+C) before continuing.

- [ ] **Step 5: Commit**

```bash
git add .storybook/
git commit -m "feat(storybook): configure Storybook 10 with Tailwind v4 + theme addon"
```

---

## Task 9: Storybook manager (branded UI theme)

**Files:**
- Create: `.storybook/manager.ts`
- Create: `.storybook/theme.ts`

- [ ] **Step 1: Write `.storybook/theme.ts`**

Create `/home/matheus/Projects/ui/.storybook/theme.ts`:

```ts
import { create } from "storybook/theming"

export default create({
  base: "light",
  brandTitle: "AM Fernandes UI",
  brandTarget: "_self",
  colorPrimary: "#000000",
  colorSecondary: "#000000",
  appBg: "#ffffff",
  appContentBg: "#ffffff",
  appBorderColor: "#dddde5",
  appBorderRadius: 8,
  fontBase: '"Google Sans Flex", sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Mono", monospace',
  textColor: "#0b0d14",
  textInverseColor: "#ffffff",
  barTextColor: "#5b6273",
  barSelectedColor: "#000000",
  barBg: "#ffffff",
  inputBg: "#ffffff",
  inputBorder: "#dddde5",
  inputTextColor: "#0b0d14",
  inputBorderRadius: 6,
})
```

- [ ] **Step 2: Write `.storybook/manager.ts`**

Create `/home/matheus/Projects/ui/.storybook/manager.ts`:

```ts
import { addons } from "storybook/manager-api"
import theme from "./theme"

addons.setConfig({ theme })
```

- [ ] **Step 3: Restart Storybook and verify branding**

```bash
bun run storybook
```

Expected: top-left brand says "AM Fernandes UI", UI is light with black accents. Stop Storybook (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add .storybook/manager.ts .storybook/theme.ts
git commit -m "feat(storybook): apply AM Fernandes brand theme to manager UI"
```

---

## Task 10: Foundations MDX — Getting Started

**Files:**
- Create: `src/docs/GettingStarted.mdx`

- [ ] **Step 1: Write `src/docs/GettingStarted.mdx`**

Create `/home/matheus/Projects/ui/src/docs/GettingStarted.mdx`:

```mdx
import { Meta } from "@storybook/addon-docs/blocks"

<Meta title="Getting Started" />

# AM Fernandes UI

Design system de componentes React da AM Fernandes. Esta documentação cobre os fundamentos visuais (cores, tipografia, espaçamento, raios, ícones) e — nas próximas releases — a biblioteca completa de componentes.

## Instalação

```bash
bun add @am-fernandes/ui
```

Configure o registro privado (uma vez por máquina):

```bash
# ~/.npmrc
@am-fernandes:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## Setup na sua app

1. Importe os tokens e a fonte no CSS de entrada da app:

```css
/* src/index.css */
@import "@am-fernandes/ui/fonts";
@import "@am-fernandes/ui/styles";
```

2. Garanta que a app usa Tailwind v4 e React 19 (peer-deps).

3. Use a helper `cn` ao combinar classes:

```tsx
import { cn } from "@am-fernandes/ui"

<div className={cn("p-4 rounded-md", isActive && "bg-primary")} />
```

## Princípios

- **Light only** — apps internas; sem dark mode por escolha de produto.
- **Tokens são a API** — não hardcode cores ou raios em apps; consuma sempre via classe Tailwind (`bg-primary`, `rounded-md`).
- **Acessibilidade ≥ AA** — status badges, contraste e ARIA validados via `addon-a11y`.

## Status atual

Fase 1 (foundations) — sem componentes. Próximas releases adicionam primitives → overlays → navigation → forms → domínio → data.
```

- [ ] **Step 2: Run Storybook, verify the page**

```bash
bun run storybook
```

Expected: sidebar shows "Getting Started" entry; opening it renders the markdown with the brand font (Google Sans Flex). Stop Storybook (Ctrl+C).

- [ ] **Step 3: Commit**

```bash
git add src/docs/GettingStarted.mdx
git commit -m "docs(foundations): add Getting Started page"
```

---

## Task 11: Foundations MDX — Colors

**Files:**
- Create: `src/docs/Colors.mdx`

- [ ] **Step 1: Write `src/docs/Colors.mdx`**

Create `/home/matheus/Projects/ui/src/docs/Colors.mdx`:

```mdx
import { Meta } from "@storybook/addon-docs/blocks"

<Meta title="Foundations/Colors" />

# Colors

Paleta OKLCH com `oklch(L C H)`. Primary é preto absoluto, secundárias semânticas (success/warning/info/destructive), e família "status" com fundos tintados para badges.

export const Swatch = ({ name, varName, fg = "var(--foreground)" }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: 8,
      border: "1px solid var(--border)",
      borderRadius: 8,
      marginBottom: 8,
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 6,
        background: `var(${varName})`,
        border: "1px solid var(--border)",
      }}
    />
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, color: fg }}>{name}</div>
      <code style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{varName}</code>
    </div>
  </div>
)

## Base

<Swatch name="Background" varName="--background" />
<Swatch name="Foreground" varName="--foreground" />
<Swatch name="Card" varName="--card" />
<Swatch name="Popover" varName="--popover" />
<Swatch name="Muted" varName="--muted" />
<Swatch name="Accent" varName="--accent" />
<Swatch name="Border" varName="--border" />
<Swatch name="Input" varName="--input" />
<Swatch name="Ring" varName="--ring" />

## Brand

<Swatch name="Primary" varName="--primary" />
<Swatch name="Secondary" varName="--secondary" />

## Semantic

<Swatch name="Destructive" varName="--destructive" />
<Swatch name="Success" varName="--success" />
<Swatch name="Warning" varName="--warning" />
<Swatch name="Info" varName="--info" />

## Status Badges (WCAG AA)

Trios bg/text/border desenhados para badges de estado em listagens.

export const StatusBadge = ({ kind, label }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 10px",
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 600,
      background: `var(--status-${kind}-bg)`,
      color: `var(--status-${kind}-text)`,
      border: `1px solid var(--status-${kind}-border)`,
      marginRight: 8,
    }}
  >
    {label}
  </span>
)

<div style={{ padding: 12 }}>
  <StatusBadge kind="success" label="Success" />
  <StatusBadge kind="warning" label="Warning" />
  <StatusBadge kind="info" label="Info" />
  <StatusBadge kind="destructive" label="Destructive" />
</div>

## Charts

<Swatch name="Chart 1" varName="--chart-1" />
<Swatch name="Chart 2" varName="--chart-2" />
<Swatch name="Chart 3" varName="--chart-3" />
<Swatch name="Chart 4" varName="--chart-4" />
<Swatch name="Chart 5" varName="--chart-5" />

## Sidebar

<Swatch name="Sidebar" varName="--sidebar" />
<Swatch name="Sidebar Foreground" varName="--sidebar-foreground" />
<Swatch name="Sidebar Primary" varName="--sidebar-primary" />
<Swatch name="Sidebar Accent" varName="--sidebar-accent" />
<Swatch name="Sidebar Border" varName="--sidebar-border" />
```

- [ ] **Step 2: Verify in Storybook**

```bash
bun run storybook
```

Expected: "Foundations / Colors" appears in sidebar; opening it shows swatches with the actual brand colors (primary is solid black, success is olive green, warning is mustard yellow, info is sky blue, destructive is pure red). Stop Storybook.

- [ ] **Step 3: Commit**

```bash
git add src/docs/Colors.mdx
git commit -m "docs(foundations): add Colors palette page"
```

---

## Task 12: Foundations MDX — Typography

**Files:**
- Create: `src/docs/Typography.mdx`

- [ ] **Step 1: Write `src/docs/Typography.mdx`**

Create `/home/matheus/Projects/ui/src/docs/Typography.mdx`:

```mdx
import { Meta } from "@storybook/addon-docs/blocks"

<Meta title="Foundations/Typography" />

# Typography

Fonte do design system: **Google Sans Flex** (variável, opsz 6–144, wght 1–1000). Disponível via `--font-sans` e na classe Tailwind `font-sans`.

A fonte é importada via `@am-fernandes/ui/fonts` (Google Fonts CDN). Para apps offline ou com restrição de CDN, baixar e self-hostear é o próximo passo (fora do escopo desta fase).

export const Specimen = ({ size, weight = 400, label }) => (
  <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
    <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 4 }}>
      {label} · {size}px · weight {weight}
    </div>
    <div style={{ fontFamily: "var(--font-sans)", fontSize: size, fontWeight: weight }}>
      A AM Fernandes constrói software.
    </div>
  </div>
)

## Escala (Tailwind defaults aplicados ao font-sans)

<Specimen size={36} weight={700} label="text-4xl / bold" />
<Specimen size={30} weight={700} label="text-3xl / bold" />
<Specimen size={24} weight={600} label="text-2xl / semibold" />
<Specimen size={20} weight={600} label="text-xl / semibold" />
<Specimen size={18} weight={500} label="text-lg / medium" />
<Specimen size={16} weight={400} label="text-base / regular" />
<Specimen size={14} weight={400} label="text-sm / regular" />
<Specimen size={12} weight={400} label="text-xs / regular" />

## Uso recomendado

| Contexto | Classe Tailwind |
|---|---|
| Page title (H1) | `text-3xl font-bold tracking-tight` |
| Section title (H2) | `text-2xl font-semibold` |
| Subsection (H3) | `text-xl font-semibold` |
| Body | `text-sm` ou `text-base` |
| Caption / metadata | `text-xs text-muted-foreground` |
```

- [ ] **Step 2: Verify in Storybook, then commit**

```bash
bun run storybook  # verify, then Ctrl+C
git add src/docs/Typography.mdx
git commit -m "docs(foundations): add Typography page"
```

---

## Task 13: Foundations MDX — Spacing

**Files:**
- Create: `src/docs/Spacing.mdx`

- [ ] **Step 1: Write `src/docs/Spacing.mdx`**

Create `/home/matheus/Projects/ui/src/docs/Spacing.mdx`:

```mdx
import { Meta } from "@storybook/addon-docs/blocks"

<Meta title="Foundations/Spacing" />

# Spacing

Usamos a escala padrão do Tailwind v4 (`spacing-*`), baseada em múltiplos de `0.25rem` (4px). Não definimos tokens próprios de spacing — manter a escala Tailwind reduz fricção para quem já conhece o framework.

export const Bar = ({ size, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0" }}>
    <code style={{ width: 90, fontSize: 12, color: "var(--muted-foreground)" }}>{label}</code>
    <div style={{ width: 50, fontSize: 12, color: "var(--muted-foreground)" }}>{size}</div>
    <div style={{ height: 12, background: "var(--primary)", width: size }} />
  </div>
)

<Bar size="4px" label="0.5 / 1" />
<Bar size="8px" label="2" />
<Bar size="12px" label="3" />
<Bar size="16px" label="4" />
<Bar size="20px" label="5" />
<Bar size="24px" label="6" />
<Bar size="32px" label="8" />
<Bar size="40px" label="10" />
<Bar size="48px" label="12" />
<Bar size="64px" label="16" />
<Bar size="80px" label="20" />
<Bar size="96px" label="24" />

## Diretrizes

- **Componentes internos:** gap `2`/`3` entre primitives (button + icon), `4`/`6` entre sections.
- **Páginas:** padding `6` em mobile, `8`–`12` em desktop.
- **Cards:** padding interno `4` ou `6`; nunca menos que `4`.
```

- [ ] **Step 2: Verify, commit**

```bash
bun run storybook  # verify, then Ctrl+C
git add src/docs/Spacing.mdx
git commit -m "docs(foundations): add Spacing page"
```

---

## Task 14: Foundations MDX — Radius

**Files:**
- Create: `src/docs/Radius.mdx`

- [ ] **Step 1: Write `src/docs/Radius.mdx`**

Create `/home/matheus/Projects/ui/src/docs/Radius.mdx`:

```mdx
import { Meta } from "@storybook/addon-docs/blocks"

<Meta title="Foundations/Radius" />

# Radius

Escala derivada da base `--radius: 0.5rem` (8px). Sete tamanhos cobrem desde inputs/botões até modais e cards grandes.

export const Box = ({ varName, label, size = 80 }) => (
  <div style={{ display: "inline-block", textAlign: "center", marginRight: 16, marginBottom: 16 }}>
    <div
      style={{
        width: size,
        height: size,
        background: "var(--primary)",
        borderRadius: `var(${varName})`,
      }}
    />
    <div style={{ fontSize: 12, marginTop: 6, color: "var(--muted-foreground)" }}>{label}</div>
    <code style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{varName}</code>
  </div>
)

<div>
  <Box varName="--radius-sm" label="sm (4px)" />
  <Box varName="--radius-md" label="md (6px)" />
  <Box varName="--radius-lg" label="lg (8px)" />
  <Box varName="--radius-xl" label="xl (12px)" />
  <Box varName="--radius-2xl" label="2xl (16px)" />
  <Box varName="--radius-3xl" label="3xl (20px)" />
  <Box varName="--radius-4xl" label="4xl (24px)" />
</div>

## Uso recomendado

| Componente | Classe |
|---|---|
| Input, button | `rounded-md` |
| Card, dialog | `rounded-lg` |
| Sheet, drawer | `rounded-xl` |
| Avatar | `rounded-full` |
```

- [ ] **Step 2: Verify, commit**

```bash
bun run storybook  # verify, then Ctrl+C
git add src/docs/Radius.mdx
git commit -m "docs(foundations): add Radius page"
```

---

## Task 15: Foundations MDX — Iconography

**Files:**
- Create: `src/docs/Iconography.mdx`

- [ ] **Step 1: Write `src/docs/Iconography.mdx`**

Create `/home/matheus/Projects/ui/src/docs/Iconography.mdx`:

```mdx
import { Meta } from "@storybook/addon-docs/blocks"

<Meta title="Foundations/Iconography" />

# Iconography

Biblioteca oficial: **[Lucide React](https://lucide.dev)** (`lucide-react`). Cada componente do DS que aceita ícone segue o padrão de slot do Radix (`[&_svg]:size-4 [&_svg]:shrink-0`) — ícones se ajustam ao container automaticamente.

## Instalação no app consumidor

```bash
bun add lucide-react
```

Não é peer-dep do `@am-fernandes/ui` (cada app escolhe sua versão de Lucide; mudanças entre minor releases são compatíveis).

## Tamanhos padronizados

| Contexto | Classe | Pixels |
|---|---|---|
| Inline (button, input) | `size-4` | 16 |
| Listagem, badge | `size-3.5` | 14 |
| Toolbar, navegação | `size-5` | 20 |
| Header / page | `size-6` | 24 |
| Empty state | `size-12` | 48 |

## Convenções

- Use `strokeWidth={2}` (padrão Lucide).
- Color via `currentColor` — não passe `color={...}` na prop; deixe o container ditar.
- Evite ícones decorativos sem `aria-hidden`. Para ícones com significado, use `aria-label` no elemento pai.

## Exemplo

```tsx
import { Search } from "lucide-react"

<button className="inline-flex items-center gap-2">
  <Search className="size-4" aria-hidden />
  Buscar
</button>
```
```

- [ ] **Step 2: Verify, commit**

```bash
bun run storybook  # verify, then Ctrl+C
git add src/docs/Iconography.mdx
git commit -m "docs(foundations): add Iconography page"
```

---

## Task 16: Sidebar sort verification & a11y sanity

**Files:** none modified — verification only.

- [ ] **Step 1: Run Storybook**

```bash
bun run storybook
```

- [ ] **Step 2: Verify sidebar order**

Expected order in left sidebar (matches `storySort` in `.storybook/preview.tsx`):

1. Getting Started
2. Foundations
   1. Colors
   2. Typography
   3. Spacing
   4. Radius
   5. Iconography

If something is out of order, the `storySort.order` array in `preview.tsx` is the source of truth — adjust there.

- [ ] **Step 3: Verify a11y addon runs**

Open the "Colors" page → click "Accessibility" tab in the bottom panel. Expected: axe-core runs, shows no Violations (only "Passes" and possibly "Incomplete"). If violations appear, they belong to MDX-generated markup and are out of scope for this phase — note them as follow-up.

- [ ] **Step 4: Verify build-storybook works**

Stop the dev server (Ctrl+C), then:

```bash
bun run build-storybook
```

Expected: `storybook-static/` directory created, exit 0, no fatal errors. Warnings about MDX `<Meta>` titles are acceptable.

- [ ] **Step 5: Verify full package build still works**

```bash
bun run build
```

Expected: exits 0, `dist/` has `index.js`, `index.d.ts`, `tokens.css`, `fonts.css`.

- [ ] **Step 6: No commit needed — verification task.**

---

## Task 17: Tag release `0.0.1`

- [ ] **Step 1: Verify clean tree and final state**

```bash
cd /home/matheus/Projects/ui
git status
git log --oneline
```

Expected: working tree clean. Log shows the spec commit followed by the chain from Tasks 1–15.

- [ ] **Step 2: Tag**

```bash
git tag -a v0.0.1 -m "Phase 1: foundations (tokens + Storybook + MDX docs)"
```

- [ ] **Step 3: Push (only if user has remote configured)**

Skip if `git remote -v` returns nothing — the repo is local-only at this point. The remote will be added when the user is ready to publish.

```bash
# Only if remote exists:
git push && git push --tags
```

---

## Self-Review

**Spec coverage (Phase 1 scope only):**

| Spec section | Plan task(s) |
|---|---|
| Estrutura de repo (root files, .storybook/, src/) | Tasks 1, 2, 3, 7, 8, 9 |
| Stack: Bun + Vite + Storybook 10 + Tailwind v4 + tsup + Biome | Tasks 2, 3, 7, 8 |
| Tokens & theming (light only) | Task 4 |
| Fonts (Google Sans Flex) | Task 5 |
| `lib/utils.cn` | Task 6 |
| package.json + exports | Task 2 |
| Storybook 10 + addons (docs, a11y, themes) | Tasks 8, 9 |
| Foundations MDX (6 pages) | Tasks 10–15 |
| Build pipeline (tsup → dist) | Task 7 |
| Phase 1 version `0.0.1` | Task 17 |

Components (Phases 2–7) and migration (Phase 8) are explicitly out of scope and will get their own plans.

**Placeholder scan:** no "TBD"/"TODO"/"similar to" patterns found. Each step contains the file contents or exact command needed.

**Type consistency:**
- `cn(...inputs: ClassValue[])` defined in Task 6, exported in `src/index.ts` same task. README and Getting Started MDX both reference `cn` import from `@am-fernandes/ui` — matches.
- `tsconfig.build.json` extends `tsconfig.json`; both reference `outDir: "dist"` consistently. `tsup.config.ts` uses `tsconfig: "./tsconfig.build.json"` — matches.
- `package.json#exports["./styles"]` points to `./dist/tokens.css`; Task 7's `build:styles` script copies to exactly that path — matches.
- `.storybook/main.ts` uses `defineMain` from `@storybook/react-vite/node` (Storybook 10 API verified via Context7).
