import * as React from "react"

export function useLimitError(
  inputRef: React.RefObject<HTMLInputElement | null>,
  problem: string | null,
) {
  const [shown, setShown] = React.useState(false)
  if (shown && problem === null) setShown(false)
  React.useLayoutEffect(() => {
    inputRef.current?.setCustomValidity(problem ?? "")
  }, [inputRef, problem])
  return { limitError: shown ? (problem ?? undefined) : undefined, setShown }
}
