/**
 * `@am-fernandes/ui` public API.
 *
 * Single entry point. Each phase of the API simplification plan adds exports here.
 *
 * See: docs/superpowers/plans/2026-05-18-api-simplification.md
 */

// Overlays
export { Dialog, type DialogProps } from "./overlays/dialog"

// Primitives
export { Avatar, type AvatarProps } from "./primitives/avatar"
export { Badge, badgeVariants, type BadgeProps } from "./primitives/badge"
export { Button, buttonVariants, type ButtonProps } from "./primitives/button"
export { Checkbox, type CheckboxProps } from "./primitives/checkbox"
export { Input, type InputProps } from "./primitives/input"
export {
  RadioGroup,
  type RadioGroupItemData,
  type RadioGroupProps,
} from "./primitives/radio-group"
export { Separator, type SeparatorProps } from "./primitives/separator"
export { Skeleton } from "./primitives/skeleton"
export { Switch, type SwitchProps } from "./primitives/switch"
export { Textarea, type TextareaProps } from "./primitives/textarea"
export {
  Typography,
  typographyVariants,
  type TypographyProps,
} from "./primitives/typography"
