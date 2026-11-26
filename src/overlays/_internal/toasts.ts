/**
 * The toasts (Sonner) float above every modal and stay usable while one is
 * open: they can be clicked and reached with the keyboard (see
 * `useToastsAboveModals` in `sonner.tsx`). They are not inside the modal,
 * though, so the modals need to know two things about them.
 */
const TOASTER = "[data-sonner-toaster]"

/**
 * A press on a toast is not a press outside the modal: "Tentar de novo" on an
 * error toast must not close the form that failed to save.
 */
export function isToastPress(event: Event) {
  const target = event.target
  return target instanceof Element && target.closest(TOASTER) !== null
}

/**
 * Escape typed with focus in the toasts is for them (it hands focus back to
 * where it was), not for the modal underneath.
 */
export function isToastFocused() {
  return typeof document !== "undefined" && document.activeElement?.closest(TOASTER) != null
}
