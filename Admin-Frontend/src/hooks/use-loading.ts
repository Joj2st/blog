import { useState, useCallback } from 'react'

interface UseLoadingOptions {
  initialState?: boolean
  minDuration?: number
}

export function useLoading(options: UseLoadingOptions = {}) {
  const { initialState = false, minDuration = 0 } = options
  const [isLoading, setIsLoading] = useState(initialState)

  const startLoading = useCallback(() => {
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const withLoading = useCallback(
    async <T>(promise: Promise<T>): Promise<T> => {
      const startTime = Date.now()
      setIsLoading(true)

      try {
        const result = await promise
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, minDuration - elapsed)

        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining))
        }

        return result
      } finally {
        setIsLoading(false)
      }
    },
    [minDuration]
  )

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  }
}

export function useLoadingMap<K extends string | number>() {
  const [loadingMap, setLoadingMap] = useState<Record<K, boolean>>({} as Record<K, boolean>)

  const setLoading = useCallback((key: K, loading: boolean) => {
    setLoadingMap((prev) => ({ ...prev, [key]: loading }))
  }, [])

  const isLoading = useCallback(
    (key: K) => {
      return loadingMap[key] || false
    },
    [loadingMap]
  )

  const withLoading = useCallback(
    async <T>(key: K, promise: Promise<T>): Promise<T> => {
      setLoading(key, true)
      try {
        return await promise
      } finally {
        setLoading(key, false)
      }
    },
    [setLoading]
  )

  return {
    loadingMap,
    setLoading,
    isLoading,
    withLoading,
  }
}
