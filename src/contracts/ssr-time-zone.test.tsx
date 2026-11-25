import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"

import { TZDate } from "@date-fns/tz"
import { act, screen } from "@testing-library/react"
import type * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { BarChart } from "../data/bar-chart"
import { dateColumn } from "../data/columns"
import { DataTable } from "../data/data-table"
import { LineChart } from "../data/line-chart"
import { Schedule, type ScheduleEvent } from "../data/schedule"
import { Calendar } from "../forms/calendar"
import { DateInput } from "../forms/date-input"
import { DateRangePicker } from "../forms/date-range-picker"
import { TimePicker } from "../forms/time-picker"

/**
 * Contract of server rendering (Next.js, Remix): what the server writes is
 * what the browser hydrates, whatever the zone of each machine. A server in
 * UTC at 22:30 in Brasília is already in the next day.
 *
 * The Schedule wrote its hours and days with the machine's zone and read
 * the machine's clock while rendering: the server HTML and the hydration
 * differed and React threw the server HTML away. The Calendar marked the
 * machine's today.
 */

const ORIGINAL_TZ = process.env.TZ

afterEach(() => {
  process.env.TZ = ORIGINAL_TZ
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.body.innerHTML = ""
})

/** 22:30 in São Paulo, 01:30 of the next day in UTC. */
const SERVER_TIME = new Date("2026-11-26T01:30:00Z")

const saoPaulo = (day: number, hour: number, minute = 0) =>
  new Date(new TZDate(2026, 10, day, hour, minute, "America/Sao_Paulo").getTime())

const events: ScheduleEvent[] = [
  { id: "visita", title: "Visita", start: saoPaulo(25, 13), end: saoPaulo(25, 14) },
  { id: "plantao", title: "Plantão", start: saoPaulo(25, 22), end: saoPaulo(26, 2) },
  { id: "feriado", title: "Feriado", start: saoPaulo(20, 0), end: saoPaulo(20, 0), allDay: true },
]

function at(zone: string, time: Date) {
  process.env.TZ = zone
  vi.useFakeTimers({ toFake: ["Date"] })
  vi.setSystemTime(time)
}

function serverHtml(element: () => React.ReactElement, zone = "UTC", time = SERVER_TIME) {
  at(zone, time)
  return renderToString(element())
}

/**
 * Renders on a server in `server`'s zone, then hydrates in a browser in
 * `browser`'s, a little later. Returns what React complained about.
 */
async function hydrate(
  element: () => React.ReactElement,
  browser = { zone: "America/Sao_Paulo", time: new Date(SERVER_TIME.getTime() + 70_000) },
) {
  const html = serverHtml(element)
  at(browser.zone, browser.time)
  const container = document.createElement("div")
  container.innerHTML = html
  document.body.append(container)
  const problems: string[] = []
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    problems.push(args.map(String).join(" "))
  })
  await act(async () => {
    hydrateRoot(container, element(), {
      onRecoverableError: (error) => problems.push(String(error)),
    })
  })
  return { container, problems }
}

type Case = { name: string; element: () => React.ReactElement }

const fixed: Case[] = [
  ...(["month", "week", "day", "list"] as const).map((view) => ({
    name: `Schedule ${view}, with today and defaultDate`,
    element: () => (
      <Schedule
        events={events}
        defaultView={view}
        today={saoPaulo(25, 22, 30)}
        defaultDate={saoPaulo(25, 22, 30)}
      />
    ),
  })),
  {
    name: "DataTable with a date column",
    element: () => (
      <DataTable
        columns={[dateColumn<{ quando: string }>({ header: "Quando", accessorKey: "quando" })]}
        data={[{ quando: "2026-11-26T01:30:00Z" }, { quando: "2026-11-25" }]}
      />
    ),
  },
  {
    name: "LineChart over ISO months",
    element: () => (
      <LineChart
        title="Vendas"
        data={[
          { mes: "2026-01", v: 3 },
          { mes: "2026-02", v: 5 },
        ]}
        x="mes"
        series={[{ key: "v", label: "Vendas" }]}
      />
    ),
  },
  {
    name: "BarChart over ISO days",
    element: () => (
      <BarChart
        title="Visitas"
        data={[
          { dia: "2026-11-25", v: 3 },
          { dia: "2026-11-26", v: 5 },
        ]}
        category="dia"
        series={[{ key: "v", label: "Visitas" }]}
      />
    ),
  },
  {
    name: "DateInput",
    element: () => <DateInput label="Data" defaultValue="2026-11-25" />,
  },
  {
    name: "DateRangePicker",
    element: () => (
      <DateRangePicker label="Período" defaultValue={{ from: "2026-11-20", to: "2026-11-25" }} />
    ),
  },
  { name: "TimePicker", element: () => <TimePicker label="Início" defaultValue="22:30" /> },
]

const clockBound: Case[] = [
  ...(["month", "week", "day", "list"] as const).map((view) => ({
    name: `Schedule ${view}, on the real clock`,
    element: () => <Schedule events={events} defaultView={view} />,
  })),
  { name: "Calendar on today's month", element: () => <Calendar mode="single" /> },
  {
    name: "Calendar with the past disabled",
    element: () => <Calendar mode="single" disabledDays="past" />,
  },
]

describe("server HTML in any zone", () => {
  it.each(fixed)("$name: the same in UTC, in São Paulo and in Tokyo", ({ element }) => {
    const utc = serverHtml(element, "UTC")
    expect(serverHtml(element, "America/Sao_Paulo")).toBe(utc)
    expect(serverHtml(element, "Asia/Tokyo")).toBe(utc)
  })

  it.each(clockBound)("$name: the same in UTC and in São Paulo at 22:30", ({ element }) => {
    expect(serverHtml(element, "America/Sao_Paulo")).toBe(serverHtml(element, "UTC"))
  })
})

describe("hydration from a server in another zone", () => {
  it.each([...fixed, ...clockBound])("$name: no mismatch", async ({ element }) => {
    const { problems } = await hydrate(element)
    expect(problems).toEqual([])
  })
})

describe("Schedule on the real clock", () => {
  it("the server writes the frame; the period and today come in the browser", async () => {
    const html = serverHtml(() => <Schedule events={events} defaultView="week" />)
    expect(html).toContain("data-pending")
    expect(html).not.toContain("Visita")

    const { container, problems } = await hydrate(() => (
      <Schedule events={events} defaultView="week" />
    ))
    expect(problems).toEqual([])
    expect(container.querySelector("[data-pending]")).toBeNull()
    // The browser's day, in São Paulo: Wednesday the 25th, not UTC's 26th.
    expect(container.querySelector('[aria-current="date"]')?.getAttribute("data-date")).toBe(
      "2026-11-25",
    )
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("22 – 28 de nov. de 2026")
  })

  it("a page rendered a day before still hydrates, on the browser's week", async () => {
    const { container, problems } = await hydrate(
      () => <Schedule events={events} defaultView="week" />,
      { zone: "America/Sao_Paulo", time: new Date("2026-12-03T15:00:00Z") },
    )
    expect(problems).toEqual([])
    expect(container.querySelector('[aria-current="date"]')?.getAttribute("data-date")).toBe(
      "2026-12-03",
    )
  })

  it("shows the hours of São Paulo on a machine in UTC", () => {
    at("UTC", SERVER_TIME)
    const html = renderToString(
      <Schedule events={events} defaultView="day" today={saoPaulo(25, 22, 30)} />,
    )
    expect(html).toContain("13:00 – 14:00")
  })

  it("follows another zone when asked", () => {
    at("UTC", SERVER_TIME)
    const html = renderToString(
      <Schedule
        events={events}
        defaultView="day"
        timeZone="Asia/Tokyo"
        today={saoPaulo(25, 22, 30)}
        defaultDate={saoPaulo(25, 13)}
      />,
    )
    // 13:00 in São Paulo is 01:00 of the next day in Tokyo.
    expect(html).toContain("01:00 – 02:00")
  })
})

/**
 * Where the library reads the clock or prints a date. A new place has to say
 * why the server and the browser agree on it: a clock read while rendering
 * differs between the two (and between today and the day a cached page was
 * made), and a date printed with the machine's zone differs between a server
 * in UTC and a browser in Brasília.
 */
const CLOCK_READS: Record<string, string> = {
  "src/data/schedule.tsx": "the browser's clock, used only once hydrated (useHydrated)",
  "src/data/tree.tsx": "typeahead timing, in a key handler",
  "src/domain/file-upload.tsx": "the name of a photo taken with the camera",
  "src/forms/_internal/date-only.ts": "todayIn: today in a fixed zone",
  "src/forms/calendar-quick-nav.tsx": "fallback of currentYear; the Calendar passes São Paulo's",
  "src/lib/date.ts": "isPast/isFuture, called by the app, in a fixed zone",
}

describe("clock reads and printed dates", () => {
  const root = path.join(__dirname, "..", "..")
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const file = path.join(dir, name)
      if (statSync(file).isDirectory()) return name === "docs" ? [] : files(file)
      return /\.tsx?$/.test(name) && !/\.(test|stories)\.tsx?$/.test(name) ? [file] : []
    })
  const sources = files(path.join(root, "src")).map((file) => ({
    file: path.relative(root, file),
    text: readFileSync(file, "utf8"),
  }))

  it("every clock read is a known one", () => {
    const reading = sources
      .filter(({ text }) => /new Date\(\)|Date\.now\(\)/.test(text))
      .map(({ file }) => file)
    expect(reading.filter((file) => !(file in CLOCK_READS))).toEqual([])
    expect(Object.keys(CLOCK_READS).filter((file) => !reading.includes(file))).toEqual([])
  })

  it("every Intl date format names its zone", () => {
    const unnamed = sources.flatMap(({ file, text }) =>
      [...text.matchAll(/new Intl\.DateTimeFormat\(([^)]*)\)/g)]
        .filter((match) => !/timeZone/.test(match[1] ?? ""))
        .map((match) => `${file}: ${match[0]}`),
    )
    expect(unnamed).toEqual([])
  })

  it("no date is printed with the machine's zone (toLocale*String on a Date)", () => {
    const local = sources.flatMap(({ file, text }) =>
      text
        .split("\n")
        .filter((line) => /\b(date|day|time)\w*\.toLocale(Date|Time)?String\(/i.test(line))
        // The calendar's month menu prints the 1st of a month it built in
        // local time: the same month on any machine.
        .filter((line) => !line.includes("formatMonthDropdown"))
        .map((line) => `${file}: ${line.trim()}`),
    )
    expect(local).toEqual([])
  })
})
