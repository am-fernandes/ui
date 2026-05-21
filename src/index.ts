/**
 * `@amfernandesinc/ui` public API.
 *
 * Single entry point. Each phase of the API simplification plan adds exports here.
 *
 * See: docs/superpowers/plans/2026-05-18-api-simplification.md
 */

// Data
export { Card, type CardProps } from "./data/card"
export {
  DataTable,
  defaultDataTableLabels,
  type DataTableDownloadable,
  type DataTableLabels,
  type DataTableProps,
} from "./data/data-table"
export {
  dateColumn,
  formattedColumn,
  type DateColumnOptions,
  type DateColumnShowTime,
  type FormattedColumnOptions,
  type TruncateOption,
} from "./data/columns"
export { Image, type ImageProps } from "./data/image"
export {
  ScrollArea,
  ScrollBar,
  type ScrollAreaOrientation,
  type ScrollAreaProps,
  type ScrollBarProps,
} from "./data/scroll-area"
export { tableStyles, type TableStyles } from "./data/table-styles"
export { Tree, type TreeNodeData, type TreeProps } from "./data/tree"
export { Video, type VideoCaptionTrack, type VideoProps } from "./data/video"

// Hooks
export { useIsMobile } from "./hooks/use-is-mobile"

// Lib
export { isValidCEP, isValidCNPJ, isValidCPF, isValidPhone } from "./lib/brazil"
export {
  centsToDisplay,
  formatBRL,
  fromCents,
  percentFromValue,
  percentOfTotal,
  toCents,
} from "./lib/currency"
export { formatCount } from "./lib/format-count"
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
  defaultCommandPaletteLabels,
  type CommandPaletteGroup,
  type CommandPaletteItem,
  type CommandPaletteLabels,
  type CommandPaletteProps,
} from "./navigation/command-palette"
export {
  Sidebar,
  type SidebarItem,
  type SidebarProps,
  type SidebarUser,
} from "./navigation/sidebar"
export { Tabs, type TabsItemData, type TabsProps } from "./navigation/tabs"

// Domain
export { CEPInput, type CEPInputProps } from "./domain/cep-input"
export { CNPJInput, type CNPJInputProps } from "./domain/cnpj-input"
export { CPFInput, type CPFInputProps } from "./domain/cpf-input"
export { CurrencyInput, type CurrencyInputProps } from "./domain/currency-input"
export {
  FileUpload,
  defaultFileUploadLabels,
  type FileUploadLabels,
  type FileUploadProps,
  type FileUploadRejection,
  type FileUploadRejectionReason,
} from "./domain/file-upload"
export { InputOTP, REGEXP_ONLY_DIGITS, type InputOTPProps } from "./domain/input-otp"
export { MultiInput, type MultiInputProps } from "./domain/multi-input"
export { PercentageInput, type PercentageInputProps } from "./domain/percentage-input"
export { PhoneInput, type PhoneInputProps } from "./domain/phone-input"

// Forms
export {
  Calendar,
  type CalendarProps,
  type DisabledDayPreset,
  type DisabledDays,
} from "./forms/calendar"
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
export { Progress, type ProgressProps } from "./overlays/progress"
export { Sheet, type SheetProps } from "./overlays/sheet"
export { Toaster, toast, type ToasterProps } from "./overlays/sonner"
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
export { Skeleton, type SkeletonProps } from "./primitives/skeleton"
export { Switch, type SwitchProps } from "./primitives/switch"
export { Textarea, type TextareaProps } from "./primitives/textarea"
export { Toggle, type ToggleProps, toggleVariants } from "./primitives/toggle"
export {
  Typography,
  typographyVariants,
  type TypographyAs,
  type TypographyProps,
} from "./primitives/typography"
