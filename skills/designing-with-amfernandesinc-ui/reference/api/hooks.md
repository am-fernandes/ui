<!-- Gerado por `bun run skill:api` a partir de src/. Não edite à mão: o teste scripts/lib/skill-api.test.ts falha se este arquivo e o código divergirem. -->

# API: Hooks

## `hooks/use-copy-to-clipboard`

### useCopyToClipboard

`import { useCopyToClipboard } from "@amfernandesinc/ui"`

Copies text to the clipboard and tells the user. `copy(text)` resolves to `true` when it worked. `copied` turns `true` for `resetAfter` milliseconds after a copy, so a button can swap its icon for a check. The error toast stays until it is closed (the library's `toast`). Outside a secure context (plain http), where `navigator.clipboard` does not exist, it falls back to the browser's copy command. Pass the options inline or memoised; a new object every render is fine, the hook reads them through a ref.

```ts
useCopyToClipboard(options: UseCopyToClipboardOptions = {}): { copy: (text: string) => Promise<boolean>; copied: boolean; }
```

## `hooks/use-debounce`

### useDebounce

`import { useDebounce } from "@amfernandesinc/ui"`

```ts
useDebounce<T>(value: T, delay: number): T
```

## `hooks/use-is-mobile` — `@amfernandesinc/ui/hooks/use-is-mobile`

### useIsMobile

`import { useIsMobile } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/hooks/use-is-mobile"`

`true` below Tailwind's `md:` breakpoint. Same query as the CSS, so a component that switches its layout with `md:` and with this hook never disagrees. `false` on the server and on the first render.

```ts
useIsMobile(): boolean
```
