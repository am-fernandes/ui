"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"
import { type Point, linePath, lineRuns, linearScale } from "./_internal/chart-scale"

export interface SparklineProps
  extends Omit<React.SVGProps<SVGSVGElement>, "width" | "height" | "role"> {
  /** The values, oldest first. A non-finite value breaks the line. */
  data: number[]
  /**
   * What the trend says, in words: the accessible name ("Vendas dos últimos
   * 12 meses, de 14 para 22"). A sparkline has no axes or tooltip, so this is
   * the only way a screen reader gets it.
   */
  label: string
  /** @default 96 */
  width?: number
  /** @default 28 */
  height?: number
}

// Room for the end dot (r 4 + the 2px ring) inside the box.
const PAD = 6

/**
 * A tiny trend line for a table cell or a metric card: no axes, no tooltip,
 * the line in the de-emphasis colour and the latest point in the accent.
 */
function Sparkline({ data, label, width = 96, height = 28, className, ...props }: SparklineProps) {
  const finite = data.filter((v) => Number.isFinite(v))
  const lo = finite.length ? Math.min(...finite) : 0
  const hi = finite.length ? Math.max(...finite) : 1
  const x = (index: number) =>
    data.length <= 1 ? width / 2 : PAD + (index * (width - PAD * 2)) / (data.length - 1)
  // A flat series sits in the middle.
  const y = lo === hi ? () => height / 2 : linearScale([lo, hi], [height - PAD, PAD])
  const points = data.map((v, i): Point | null =>
    Number.isFinite(v) ? { x: x(i), y: y(v) } : null,
  )
  let last = -1
  for (let i = data.length - 1; i >= 0; i--) {
    if (Number.isFinite(data[i])) {
      last = i
      break
    }
  }

  return (
    <svg
      role="img"
      aria-label={label}
      data-slot="sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("inline-block shrink-0 overflow-visible align-middle", className)}
      {...props}
    >
      {lineRuns(points).map((run) =>
        run.length > 1 ? (
          <path
            key={run[0]?.x}
            d={linePath(run)}
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            data-slot="sparkline-line"
            className="stroke-muted-foreground forced-colors:stroke-[CanvasText]"
          />
        ) : null,
      )}
      {last !== -1 ? (
        <circle
          data-slot="sparkline-end"
          cx={x(last)}
          cy={y(data[last] as number)}
          r={4}
          strokeWidth={2}
          className="fill-chart-1 stroke-card forced-colors:fill-[Highlight]"
        />
      ) : null}
    </svg>
  )
}

Sparkline.displayName = "Sparkline"

export { Sparkline }
