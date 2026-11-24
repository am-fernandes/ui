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
 * When storage is blocked (private mode, sandboxed iframes) the value lives
 * in memory for the page's lifetime, so the toggle still works.
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
  try {
    return parse(window.localStorage.getItem(key))
  } catch {
    return memory.get(key) ?? null
  }
}

export function writeStoredBoolean(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    // Storage blocked: keep the choice for this page only.
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
  // Another tab changed the choice.
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) listener()
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
