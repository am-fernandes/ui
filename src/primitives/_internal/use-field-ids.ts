import * as React from "react"

interface DescribedByOptions {
  description: boolean
  error: boolean
}

/** An id, or several separated by spaces; falsy values are skipped. */
type IdList = string | false | null | undefined

interface FieldIds {
  controlId: string
  labelId: string
  descriptionId: string
  errorId: string
  /**
   * The `aria-describedby` of the control: the description and the error that
   * are on screen, then any other id — a counter, and the `aria-describedby`
   * the consumer passed. A component must add the consumer's ids here and not
   * let them replace its own: with a spread, a hint passed from outside would
   * silence the error message.
   */
  describedBy: (opts: DescribedByOptions, ...others: IdList[]) => string | undefined
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
    ({ description, error }: DescribedByOptions, ...others: IdList[]) => {
      const ids = new Set<string>()
      if (description) ids.add(descriptionId)
      if (error) ids.add(errorId)
      for (const other of others) {
        if (!other) continue
        for (const id of other.split(/\s+/)) if (id) ids.add(id)
      }
      return ids.size === 0 ? undefined : Array.from(ids).join(" ")
    },
    [descriptionId, errorId],
  )

  return { controlId, labelId, descriptionId, errorId, describedBy }
}
