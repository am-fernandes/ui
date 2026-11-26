import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type * as React from "react"
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { AlertDialog } from "./alert-dialog"
import { Dialog } from "./dialog"
import { Sheet } from "./sheet"
import { Toaster, toast } from "./sonner"

// A modal makes the page behind it inert, and for the modal the toasts are
// part of that page: they could not be clicked, the keyboard could not reach
// them, and a click on "Tentar de novo" closed the form that failed to save.

// Sonner captures the pointer on a press (to follow a swipe); jsdom has no
// pointer capture.
const pointerCapture = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "setPointerCapture")
beforeAll(() => {
  HTMLElement.prototype.setPointerCapture = () => {}
})
afterAll(() => {
  if (pointerCapture) {
    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", pointerCapture)
  } else {
    Reflect.deleteProperty(HTMLElement.prototype, "setPointerCapture")
  }
})

afterEach(() => {
  act(() => {
    toast.dismiss()
  })
})

// Radix registers its outside-press listener on the next tick.
async function flushLayerSetup() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

async function showToast() {
  const onAction = vi.fn()
  act(() => {
    toast.error("Não foi possível salvar", {
      action: { label: "Tentar de novo", onClick: onAction },
    })
  })
  const action = await screen.findByRole("button", { name: "Tentar de novo" })
  return { action, onAction, toastElement: action.closest("[data-sonner-toast]") as HTMLElement }
}

type ModalProps = { onOpenChange: (open: boolean) => void }

const dismissibleModals = [
  {
    name: "Dialog",
    Modal: ({ onOpenChange }: ModalProps) => (
      <Dialog open onOpenChange={onOpenChange} title="Editar proposta">
        <input aria-label="Cliente" />
      </Dialog>
    ),
    overlay: '[data-slot="dialog-overlay"]',
  },
  {
    name: "Sheet",
    Modal: ({ onOpenChange }: ModalProps) => (
      <Sheet open onOpenChange={onOpenChange} title="Editar proposta">
        <input aria-label="Cliente" />
      </Sheet>
    ),
    overlay: '[data-slot="sheet-overlay"]',
  },
] as const

const allModals: ReadonlyArray<{ name: string; Modal: (props: ModalProps) => React.ReactNode }> = [
  ...dismissibleModals,
  {
    name: "AlertDialog",
    Modal: ({ onOpenChange }: ModalProps) => (
      <AlertDialog
        open
        onOpenChange={onOpenChange}
        title="Excluir proposta?"
        description="Não pode ser desfeito."
        onConfirm={() => {}}
      />
    ),
  },
]

describe("Toaster with a modal open", () => {
  it("turns pointer events back on for itself (the modal turns them off on <body>)", async () => {
    render(
      <>
        <Toaster />
        <Dialog open title="X">
          body
        </Dialog>
      </>,
    )
    const { toastElement } = await showToast()
    expect(document.body.style.pointerEvents).toBe("none")
    expect(toastElement.closest("[data-sonner-toaster]")).toHaveStyle({ pointerEvents: "auto" })
  })

  describe.each(dismissibleModals)("$name", ({ Modal, overlay }) => {
    it("stays open on a press on a toast, and the toast's action runs", async () => {
      const onOpenChange = vi.fn()
      render(
        <>
          <Toaster />
          <Modal onOpenChange={onOpenChange} />
        </>,
      )
      await flushLayerSetup()
      const { action, onAction } = await showToast()
      fireEvent.pointerDown(action)
      fireEvent.click(action)
      expect(onAction).toHaveBeenCalledTimes(1)
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it("still closes on a press on the backdrop", async () => {
      const onOpenChange = vi.fn()
      render(
        <>
          <Toaster />
          <Modal onOpenChange={onOpenChange} />
        </>,
      )
      await flushLayerSetup()
      await showToast()
      fireEvent.pointerDown(document.querySelector(overlay) as Element)
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe.each(allModals)("$name", ({ Modal }) => {
    it("lets focus go into a toast and stay there", async () => {
      render(
        <>
          <Toaster />
          <Modal onOpenChange={() => {}} />
        </>,
      )
      const { action } = await showToast()
      // The modal traps focus: anything else it would take back at once.
      act(() => action.focus())
      expect(action).toHaveFocus()
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20))
      })
      expect(action).toHaveFocus()
    })

    it("does not close on Escape typed with focus in a toast; the next Escape closes it", async () => {
      const onOpenChange = vi.fn()
      render(
        <>
          <Toaster />
          <Modal onOpenChange={onOpenChange} />
        </>,
      )
      const inModal = document.activeElement as HTMLElement
      expect(inModal.closest('[role="dialog"], [role="alertdialog"]')).not.toBeNull()
      const { action } = await showToast()
      act(() => action.focus())

      await userEvent.keyboard("{Escape}")
      expect(onOpenChange).not.toHaveBeenCalled()
      // Escape hands focus back to where it was, in the modal.
      await waitFor(() => expect(inModal).toHaveFocus())

      await userEvent.keyboard("{Escape}")
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it("still takes focus back from anything else outside the modal", async () => {
    render(
      <>
        <button type="button">Atrás do modal</button>
        <Toaster />
        <Dialog open title="X">
          <input aria-label="Cliente" />
        </Dialog>
      </>,
    )
    const behind = screen.getByText("Atrás do modal")
    act(() => behind.focus())
    await waitFor(() => expect(behind).not.toHaveFocus())
    expect(document.activeElement?.closest('[role="dialog"]')).not.toBeNull()
  })
})
