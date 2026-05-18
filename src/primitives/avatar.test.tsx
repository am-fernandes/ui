import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Avatar, AvatarFallback } from "./avatar"

describe("Avatar", () => {
  it("renders fallback text", () => {
    render(
      <Avatar>
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText("AM")).toBeInTheDocument()
  })
})
