/**
 * `@am-fernandes/ui` public API.
 *
 * Single entry point. Each phase of the API simplification plan adds exports here.
 *
 * See: docs/superpowers/plans/2026-05-18-api-simplification.md
 */

// Data
export { Card, type CardProps } from "./data/card"
export { DataTable, type DataTableProps } from "./data/data-table"
export { Image, type ImageProps } from "./data/image"
export { ScrollArea, type ScrollAreaOrientation } from "./data/scroll-area"
export { tableStyles, type TableStyles } from "./data/table-styles"
export { Tree, type TreeNodeData, type TreeProps } from "./data/tree"
export { Video, type VideoCaptionTrack, type VideoProps } from "./data/video"

// Hooks
export { useIsMobile } from "./hooks/use-is-mobile"

// Lib
export {
  centsToDisplay,
  formatBRL,
  fromCents,
  percentFromValue,
  percentOfTotal,
  toCents,
} from "./lib/currency"
export { bytes, gb, kb, mb } from "./lib/size"
export { cn } from "./lib/utils"

// Navigation
export { Accordion, type AccordionItemData, type AccordionProps } from "./navigation/accordion"
export {
  Breadcrumb,
  type BreadcrumbItemData,
  type BreadcrumbProps,
} from "./navigation/breadcrumb"
export {
  CommandPalette,
  type CommandPaletteGroup,
  type CommandPaletteItem,
  type CommandPaletteProps,
} from "./navigation/command-palette"
export {
  Sidebar,
  type SidebarGroup,
  type SidebarItem,
  type SidebarProps,
} from "./navigation/sidebar"
export { Tabs, type TabsItemData, type TabsProps } from "./navigation/tabs"

// Domain
export { CurrencyInput, type CurrencyInputProps } from "./domain/currency-input"
export {
  FileUpload,
  type FileUploadProps,
  type FileUploadRejection,
  type FileUploadRejectionReason,
} from "./domain/file-upload"
export { InputOTP, REGEXP_ONLY_DIGITS, type InputOTPProps } from "./domain/input-otp"
export { MultiInput, type MultiInputProps } from "./domain/multi-input"
export { PercentageInput, type PercentageInputProps } from "./domain/percentage-input"

// Forms
export { Calendar } from "./forms/calendar"
export {
  Combobox,
  useComboboxOptions,
  type ComboboxOption,
  type ComboboxProps,
} from "./forms/combobox"
export { DateInput, type DateInputProps } from "./forms/date-input"
export {
  DateRangePicker,
  type DateRangePickerProps,
  type DateRangeValue,
} from "./forms/date-range-picker"
export { TimePicker, type TimePickerProps } from "./forms/time-picker"

// Overlays
export { Alert, alertVariants, type AlertProps } from "./overlays/alert"
export { AlertDialog, type AlertDialogProps } from "./overlays/alert-dialog"
export { Collapsible, type CollapsibleProps } from "./overlays/collapsible"
export { Dialog, type DialogProps } from "./overlays/dialog"
export { Popover, type PopoverProps } from "./overlays/popover"
export { Progress } from "./overlays/progress"
export { Sheet, type SheetProps } from "./overlays/sheet"
export { Toaster, toast } from "./overlays/sonner"
export { Tooltip, type TooltipProps } from "./overlays/tooltip"

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
