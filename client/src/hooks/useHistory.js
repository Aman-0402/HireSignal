import { useState, useEffect } from 'react'

const HISTORY_KEY = 'hiresignal_history'
const MAX_HISTORY = 5

export function useHistory() {
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [] }
    catch { return [] }
  })

  function save(entry) {
    const updated = [{ ...entry, savedAt: new Date().toISOString() }, ...history].slice(0, MAX_HISTORY)
    setHistory(updated)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  }

  function clear() {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  return { history, save, clear }
}
