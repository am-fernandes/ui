/**
 * Tamanhos de controle compartilhados por botões, campos, gatilhos e toggles.
 *
 * A altura é a da caixa inteira (borda incluída) e vem dos tokens
 * `--spacing-control-*` de `tokens.css`: sm 32px, md 40px, lg 44px. Um
 * controle com borda e um sem borda do mesmo tamanho ficam alinhados numa
 * linha. Controles que crescem com o conteúdo (Textarea, MultiInput) usam a
 * altura mínima.
 */
export type ControlSize = "sm" | "md" | "lg"

export const controlHeight: Record<ControlSize, string> = {
  sm: "h-control-sm",
  md: "h-control-md",
  lg: "h-control-lg",
}

export const controlMinHeight: Record<ControlSize, string> = {
  sm: "min-h-control-sm",
  md: "min-h-control-md",
  lg: "min-h-control-lg",
}

/** Caixa quadrada: botão só com ícone. */
export const controlSquare: Record<ControlSize, string> = {
  sm: "size-control-sm",
  md: "size-control-md",
  lg: "size-control-lg",
}

/** Respiro horizontal do conteúdo de um controle com texto. */
export const controlPaddingX: Record<ControlSize, string> = {
  sm: "px-2.5",
  md: "px-3",
  lg: "px-4",
}
