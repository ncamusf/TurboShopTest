import { useEffect, useRef } from 'react'

/**
 * Hook for real-time updates using polling
 * @param {Function} fetchFn - Function to call for updates
 * @param {number} interval - Polling interval in milliseconds
 * @param {boolean} enabled - Whether polling is enabled
 */
export function useRealTimeUpdate(fetchFn, interval = 30000, enabled = true) {
  const intervalRef = useRef(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    if (!enabled) {
      return
    }

    // Start polling
    intervalRef.current = setInterval(() => {
      if (isMountedRef.current && document.visibilityState === 'visible') {
        fetchFn()
      }
    }, interval)

    // Cleanup
    return () => {
      isMountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchFn, interval, enabled])

  // Pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && intervalRef.current) {
        clearInterval(intervalRef.current)
      } else if (document.visibilityState === 'visible' && enabled) {
        // Resume polling
        intervalRef.current = setInterval(() => {
          if (isMountedRef.current) {
            fetchFn()
          }
        }, interval)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchFn, interval, enabled])
}

