import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ScheduleEventButton } from "./schedule-event"

const visita = {
  id: "a",
  title: "Visita",
  start: new Date(2026, 10, 18, 9),
  end: new Date(2026, 10, 18, 10),
}

describe("ScheduleEventButton", () => {
  it("works outside a Schedule with the default context, and a row falls back to the event's day", () => {
    const { container } = render(<ScheduleEventButton variant="row" event={visita} />)
    // The default context has no click handler: plain content with its full name.
    const event = container.querySelector('[data-slot="schedule-event"]') as HTMLElement
    expect(event.tagName).toBe("DIV")
    expect(event).toHaveTextContent("09:00 – 10:00")
    expect(screen.getByText("Visita, quarta-feira, 18 de novembro, 09:00 – 10:00")).toHaveClass(
      "sr-only",
    )
  })
})
