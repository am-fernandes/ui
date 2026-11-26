/**
 * `@amfernandesinc/ui` public API.
 */

// Data
export { Card, type CardProps } from "./data/card"
export {
  BarChart,
  type BarChartProps,
  type ChartLabels,
  type ChartSeries,
  defaultChartLabels,
} from "./data/bar-chart"
export { LineChart, type LineChartProps } from "./data/line-chart"
export { Sparkline, type SparklineProps } from "./data/sparkline"
export {
  DataTable,
  defaultDataTableLabels,
  type ColumnDef,
  type DataTableColumnKey,
  type DataTableColumnMeta,
  type DataTableDownloadable,
  type DataTableLabels,
  type DataTableProps,
  type ExportScope,
  type PaginationState,
  type SortingState,
} from "./data/data-table"
export {
  dateColumn,
  formattedColumn,
  type DateColumnOptions,
  type DateColumnShowTime,
  type FormattedColumnOptions,
  type TruncateOption,
} from "./data/columns"
export { EmptyState, type EmptyStateProps } from "./data/empty-state"
export { defaultImageLabels, Image, type ImageLabels, type ImageProps } from "./data/image"
export {
  ScrollArea,
  ScrollBar,
  type ScrollAreaOrientation,
  type ScrollAreaProps,
  type ScrollBarProps,
} from "./data/scroll-area"
export {
  Schedule,
  defaultScheduleLabels,
  getScheduleRange,
  type ScheduleColor,
  type ScheduleEvent,
  type ScheduleLabels,
  type ScheduleProps,
  type ScheduleView,
} from "./data/schedule"
export { tableStyles, type TableStyles } from "./data/table-styles"
export {
  Tree,
  defaultTreeLabels,
  type TreeLabels,
  type TreeNodeData,
  type TreeProps,
} from "./data/tree"
export {
  defaultVideoLabels,
  Video,
  type VideoCaptionTrack,
  type VideoLabels,
  type VideoProps,
} from "./data/video"

// Hooks
export { useCopyToClipboard } from "./hooks/use-copy-to-clipboard"
export { useDebounce } from "./hooks/use-debounce"
export { useIsMobile } from "./hooks/use-is-mobile"

// Lib
export { isValidCEP, isValidCNPJ, isValidCPF, isValidPhone } from "./lib/brazil"
export {
  centsToDisplay,
  formatBRL,
  fromCents,
  parseBRNumber,
  parseMaskedValue,
  percentFromValue,
  percentOfTotal,
  toCents,
  toBRLMoney,
} from "./lib/currency"
export {
  DEFAULT_TIME_ZONE,
  addDays,
  addMonths,
  compareDates,
  diffInDays,
  endOfDay,
  endOfMonth,
  formatDate,
  isFuture,
  isPast,
  isSameDay,
  isValidDate,
  parseDate,
  startOfDay,
  startOfMonth,
  subDays,
  type DateFormat,
} from "./lib/date"
export { formatCount } from "./lib/format-count"
export { formatCEP, formatCNPJ, formatCPF, formatPhone } from "./lib/format"
export type { RenderLink, RenderLinkProps } from "./lib/render-link"
export { bytes, gb, kb, mb } from "./lib/size"
export { compareText, matchesSearch, normalizeText } from "./lib/text"
export {
  DEFAULT_ALLOWED_LINK_PROTOCOLS,
  DEFAULT_ALLOWED_RESOURCE_PROTOCOLS,
  isAllowedUrl,
} from "./lib/url"
export { cn } from "./lib/utils"

// Navigation
export { Accordion, type AccordionItemData, type AccordionProps } from "./navigation/accordion"
export {
  AppShell,
  defaultAppShellLabels,
  useAppShell,
  type AppShellItem,
  type AppShellLabels,
  type AppShellProps,
  type AppShellState,
  type SidebarItem,
} from "./navigation/app-shell"
export {
  Breadcrumb,
  defaultBreadcrumbLabels,
  type BreadcrumbItemData,
  type BreadcrumbLabels,
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
  Pagination,
  defaultPaginationLabels,
  getPaginationItems,
  type PaginationLabels,
  type PaginationProps,
} from "./navigation/pagination"
export {
  Stepper,
  defaultStepperLabels,
  type StepperLabels,
  type StepperProps,
  type StepperStep,
} from "./navigation/stepper"
export { Tabs, type TabsItemData, type TabsProps } from "./navigation/tabs"

// Domain
export {
  CEPInput,
  defaultCEPInputLabels,
  type CEPInputLabels,
  type CEPInputProps,
} from "./domain/cep-input"
export { CNPJInput, type CNPJInputProps } from "./domain/cnpj-input"
export { CPFInput, type CPFInputProps } from "./domain/cpf-input"
export { CurrencyInput, type CurrencyInputProps } from "./domain/currency-input"
export {
  FileUpload,
  defaultFileUploadLabels,
  type FileSizeUnits,
  type FileUploadItem,
  type FileUploadLabels,
  type FileUploadProps,
  type FileUploadRejection,
  type FileUploadRejectionReason,
} from "./domain/file-upload"
export { InputOTP, REGEXP_ONLY_DIGITS, type InputOTPProps } from "./domain/input-otp"
export {
  MultiInput,
  defaultMultiInputLabels,
  type MultiInputLabels,
  type MultiInputProps,
} from "./domain/multi-input"
export { PercentageInput, type PercentageInputProps } from "./domain/percentage-input"
export { PhoneInput, type PhoneInputProps } from "./domain/phone-input"

// Forms
export {
  Calendar,
  defaultCalendarLabels,
  type CalendarLabels,
  type CalendarProps,
  type DisabledDayPreset,
  type DisabledDays,
} from "./forms/calendar"
export {
  Combobox,
  defaultComboboxLabels,
  useComboboxOptions,
  type ComboboxLabels,
  type ComboboxOption,
  type ComboboxProps,
} from "./forms/combobox"
export {
  defaultSelectLabels,
  Select,
  type SelectGroup,
  type SelectLabels,
  type SelectOption,
  type SelectProps,
} from "./forms/select"
export {
  DateInput,
  defaultDateInputLabels,
  type DateInputLabels,
  type DateInputProps,
} from "./forms/date-input"
export {
  DateRangePicker,
  defaultDateRangePickerLabels,
  type DateRangePickerLabels,
  type DateRangePickerProps,
  type DateRangeValue,
} from "./forms/date-range-picker"
export {
  TimePicker,
  defaultTimePickerLabels,
  type TimePickerLabels,
  type TimePickerProps,
} from "./forms/time-picker"

// Overlays
export { Alert, alertVariants, type AlertProps } from "./overlays/alert"
export { AlertDialog, type AlertDialogProps } from "./overlays/alert-dialog"
export { Collapsible, type CollapsibleProps } from "./overlays/collapsible"
export { Dialog, type DialogProps } from "./overlays/dialog"
export {
  DropdownMenu,
  type DropdownMenuActionItem,
  type DropdownMenuCheckboxItem,
  type DropdownMenuEntry,
  type DropdownMenuGroup,
  type DropdownMenuProps,
  type DropdownMenuRadioGroup,
  type DropdownMenuRadioOption,
  type DropdownMenuSeparator,
  type DropdownMenuSubmenu,
} from "./overlays/dropdown-menu"
export { Popover, type PopoverProps } from "./overlays/popover"
export { Progress, type ProgressProps } from "./overlays/progress"
export { Sheet, type SheetProps } from "./overlays/sheet"
export {
  Toaster,
  defaultToasterLabels,
  toast,
  type ToasterLabels,
  type ToasterProps,
} from "./overlays/sonner"
export { Tooltip, type TooltipProps } from "./overlays/tooltip"
export {
  Tour,
  defaultTourLabels,
  type TourCloseReason,
  type TourLabels,
  type TourProps,
  type TourStep,
  type TourTarget,
} from "./overlays/tour"

// Primitives
export { Avatar, type AvatarProps } from "./primitives/avatar"
export { Badge, badgeVariants, type BadgeProps } from "./primitives/badge"
export {
  Button,
  buttonVariants,
  defaultButtonLabels,
  type ButtonLabels,
  type ButtonProps,
} from "./primitives/button"
export { Checkbox, type CheckboxProps } from "./primitives/checkbox"
export {
  IconButton,
  type IconButtonProps,
  type IconButtonSize,
  type IconButtonVariant,
} from "./primitives/icon-button"
export { Input, type InputProps } from "./primitives/input"
export {
  defaultNumberInputLabels,
  NumberInput,
  type NumberInputLabels,
  type NumberInputProps,
} from "./primitives/number-input"
export {
  defaultSliderLabels,
  Slider,
  type SliderLabels,
  type SliderMark,
  type SliderProps,
  type SliderRangeProps,
  type SliderSingleProps,
} from "./primitives/slider"
export {
  RadioGroup,
  type RadioGroupItemData,
  type RadioGroupProps,
} from "./primitives/radio-group"
export {
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlProps,
} from "./primitives/segmented-control"
export { Separator, type SeparatorProps } from "./primitives/separator"
export {
  Skeleton,
  SkeletonGroup,
  defaultSkeletonLabels,
  type SkeletonGroupProps,
  type SkeletonLabels,
  type SkeletonProps,
} from "./primitives/skeleton"
export { Switch, type SwitchProps } from "./primitives/switch"
export {
  Textarea,
  defaultTextareaLabels,
  type TextareaLabels,
  type TextareaProps,
} from "./primitives/textarea"
export { Toggle, type ToggleProps, toggleVariants } from "./primitives/toggle"
export {
  Token,
  defaultTokenLabels,
  type TokenColor,
  type TokenLabels,
  type TokenProps,
} from "./primitives/token"
export {
  Typography,
  typographyVariants,
  type TypographyAs,
  type TypographyProps,
} from "./primitives/typography"
