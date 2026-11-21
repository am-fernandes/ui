import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ScheduleEventButton } from "./schedule-event"

describe("ScheduleEventButton", () => {
  it("works outside a Schedule with the default context, and a row falls back to the event's day", () => {
    render(
      <ScheduleEventButton
        variant="row"
        event={{
          id: "a",
          title: "Visita",
          start: new Date(2026, 10, 18, 9),
          end: new Date(2026, 10, 18, 10),
        }}
      />,
    )
    const button = screen.getByRole("button", {
      name: "Visita, quarta-feira, 18 de novembro, 09:00 – 10:00",
    })
    expect(button).toHaveTextContent("09:00 – 10:00")
  })
})
