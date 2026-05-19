/**
 * Shared Radix overlay animation utilities.
 *
 * Used by Dialog, AlertDialog, and Sheet to keep open/close transitions in lockstep.
 * Centralize tweaks here — any change to overlay timing should happen in one place.
 */

/** Animação base do overlay (escurecimento). */
export const overlayBase =
  "fixed inset-0 z-[var(--z-overlay)] bg-black/80 duration-[var(--motion-slow)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"

/** Animação base do content centrado (Dialog/AlertDialog). */
export const dialogContentBase =
  "fixed left-[50%] top-[50%] z-[var(--z-modal)] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 duration-[var(--motion-slow)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
