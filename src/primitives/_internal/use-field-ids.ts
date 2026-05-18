import * as React from "react"

interface DescribedByOptions {
  description: boolean
  error: boolean
}

interface FieldIds {
  controlId: string
  labelId: string
  descriptionId: string
  errorId: string
  describedBy: (opts: DescribedByOptions) => string | undefined
}

/**
 * Stable ARIA wiring for label / description / error around any form control.
 * Pass an external `id` if you want consumer-controlled ids; otherwise React
 * auto-generates a stable id per mount.
 */
export function useFieldIds(externalId?: string): FieldIds {
  const reactId = React.useId()
  const controlId = externalId ?? `${reactId}-control`
  const labelId = `${reactId}-label`
  const descriptionId = `${reactId}-description`
  const errorId = `${reactId}-error`

  const describedBy = React.useCallback(
    ({ description, error }: DescribedByOptions) => {
      const ids: string[] = []
      if (description) ids.push(descriptionId)
      if (error) ids.push(errorId)
      return ids.length === 0 ? undefined : ids.join(" ")
    },
    [descriptionId, errorId],
  )

  return { controlId, labelId, descriptionId, errorId, describedBy }
}
