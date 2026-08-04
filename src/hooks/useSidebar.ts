import { useState, useCallback } from 'react'

/**
 * Custom hook to manage sidebar state.
 * Centralized sidebar hook adhering to UI.README.md specifications.
 */
export function useSidebar(initialCollapsed = false) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  const toggle = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  return { collapsed, setCollapsed, toggle }
}
