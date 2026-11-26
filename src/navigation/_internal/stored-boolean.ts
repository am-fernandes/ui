"use client"

import * as React from "react"

/**
 * A `true`/`false` choice saved in localStorage, read through
 * `useSyncExternalStore`.
 *
 * The server (and the first client render, while hydrating) sees no saved
 * value (`null`), so the server HTML and the hydrating tree always agree; the
 * saved value is applied right after hydration. Reading it in a `useState`
 * initialiser instead makes React throw the server HTML away whenever the two
 * differ.
 *
 * When saving fails (storage full, private mode, sandboxed iframes) the value
 * lives in memory for the page's lifetime, so the toggle still works. A
 * choice kept in memory wins over what storage holds: reading storage first
 * (when only the write failed, as with a full storage) gave back the old
 * value, or nothing, and the toggle did nothing.
 */

const listeners = new Map<string, Set<() => void>>()
const memory = new Map<string, boolean>()

function parse(raw: string | null): boolean | null {
  if (raw === "true") return true
  if (raw === "false") return false
  return null
}

export function readStoredBoolean(key: string): boolean | null {
  if (typeof window === "undefined") return null
  // A choice this page could not save is the latest one.
  const kept = memory.get(key)
  if (kept !== undefined) return kept
  try {
    return parse(window.localStorage.getItem(key))
  } catch {
    return null
  }
}

export function writeStoredBoolean(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, String(value))
    // Saved: storage holds the choice again.
    memory.delete(key)
  } catch {
    // Not saved (blocked or full): keep the choice for this page only.
    memory.set(key, value)
  }
  for (const listener of listeners.get(key) ?? []) listener()
}

function subscribe(key: string, listener: () => void) {
  let set = listeners.get(key)
  if (!set) {
    set = new Set()
    listeners.set(key, set)
  }
  set.add(listener)
  // Another tab changed the choice: storage has the latest one again.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== key && event.key !== null) return
    memory.delete(key)
    listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    set.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

const noop = () => () => {}
const getNull = () => null

/** The saved choice under `key`, or `null` when there is none (or no key). */
export function useStoredBoolean(key: string | null): boolean | null {
  const subscribeToKey = React.useCallback(
    (listener: () => void) => (key ? subscribe(key, listener) : noop()),
    [key],
  )
  const getSnapshot = React.useCallback(() => (key ? readStoredBoolean(key) : null), [key])
  return React.useSyncExternalStore(subscribeToKey, getSnapshot, getNull)
}
