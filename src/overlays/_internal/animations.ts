/**
 * Shared Radix overlay animation utilities.
 *
 * Timing follows the Astryx motion tokens: each layer enters with its own
 * duration on the decelerating `--ease-standard` curve and leaves faster, on
 * `--duration-exit` with the accelerating `--ease-exit`. Keep the class
 * strings literal: Tailwind finds them by scanning the source.
 */

/** Tooltip: small and frequent. */
export const motionTooltip =
  "duration-(--duration-fast) ease-(--ease-standard) data-[state=closed]:duration-(--duration-exit) data-[state=closed]:ease-(--ease-exit)"

/** Menus (DropdownMenu): open as fast as the hover that leads to them. */
export const motionMenu =
  "duration-(--duration-fast) ease-(--ease-standard) data-[state=closed]:duration-(--duration-exit) data-[state=closed]:ease-(--ease-exit)"

/** Popover and Tour: a bigger surface, the low end of the medium band. */
export const motionPopover =
  "duration-(--duration-medium-min) ease-(--ease-standard) data-[state=closed]:duration-(--duration-exit) data-[state=closed]:ease-(--ease-exit)"

/** Dialog and AlertDialog (and their backdrop): the top of the medium band. */
export const motionDialog =
  "duration-(--duration-medium-max) ease-(--ease-standard) data-[state=closed]:duration-(--duration-exit) data-[state=closed]:ease-(--ease-exit)"

/** Sheets and drawers travel across the screen, both ways at the medium pace. */
export const motionSheet =
  "duration-(--duration-medium) ease-(--ease-standard) data-[state=closed]:ease-(--ease-exit)"

/** Animação base do overlay (escurecimento). */
export const overlayBase =
  "fixed inset-0 z-[var(--z-overlay)] bg-black/80 duration-(--duration-medium-max) ease-(--ease-standard) data-[state=closed]:duration-(--duration-exit) data-[state=closed]:ease-(--ease-exit) data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"

/** Animação base do content centrado (Dialog/AlertDialog). */
export const dialogContentBase =
  "fixed left-[50%] top-[50%] z-[var(--z-modal)] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 duration-(--duration-medium-max) ease-(--ease-standard) data-[state=closed]:duration-(--duration-exit) data-[state=closed]:ease-(--ease-exit) data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-container"
