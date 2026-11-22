/**
 * The scrolling body shared by Dialog, AlertDialog and Sheet.
 *
 * The modal is a column capped at the height of the screen. Title, description
 * and footer keep their size (`shrink-0`); this body is the only part that
 * gives way, and it scrolls.
 *
 * A scroll container clips at its own edge, the focus ring of a control
 * included (2px wide, 3px away). So the body is larger than its content on
 * every side: a negative margin, and the same amount back as padding.
 * Sideways it goes all the way to the edge of the modal, which also puts the
 * scrollbar there instead of next to the fields. Above and below it takes
 * 6px from the gap. `scroll-py-2` stops a control that focus scrolls into
 * view 8px short of the edge, for the same ring.
 *
 * Keep the class strings literal: Tailwind finds them by scanning the source.
 */
const modalBodyBase = "min-h-0 overflow-y-auto overscroll-contain scroll-py-2 -my-1.5 py-1.5"

/** Default padding of the modal (`p-6`): the body reaches its edge. */
const modalBodyBleed = "-mx-6 px-6"

/** The modal sets its own padding: only the room a focus ring needs. */
const modalBodyGutter = "-mx-1.5 px-1.5"

// `p-0`, `px-8`, `sm:p-4`, `ps-2`, `p-0!`… any utility that sets the inline
// padding. `py-*`, `pt-*` and `pb-*` do not count.
const INLINE_PADDING = /(?:^|[\s:!])p[xselr]?-/

/**
 * Classes of the scrolling body. `contentClassName` is the `className` the
 * consumer gave the modal: with a padding of its own there (`p-0` for a list
 * or an image that goes edge to edge), the body stops following the default
 * `p-6` and keeps to the content box.
 */
export function modalBodyClass(contentClassName?: string) {
  const customPadding = contentClassName != null && INLINE_PADDING.test(contentClassName)
  return `${modalBodyBase} ${customPadding ? modalBodyGutter : modalBodyBleed}`
}
