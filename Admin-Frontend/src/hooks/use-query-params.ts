import { useState, useCallback, useEffect } from 'react'

interface QueryParams {
  [key: string]: string | string[] | undefined
}

export function useQueryParams() {
  const getQueryParams = useCallback((): QueryParams => {
    if (typeof window === 'undefined') return {}

    const params = new URLSearchParams(window.location.search)
    const result: QueryParams = {}

    params.forEach((value, key) => {
      const existing = result[key]
      if (existing) {
        result[key] = Array.isArray(existing)
          ? [...existing, value]
          : [existing, value]
      } else {
        result[key] = value
      }
    })

    return result
  }, [])

  const [params, setParamsState] = useState<QueryParams>(getQueryParams)

  const setQueryParams = useCallback(
    (newParams: QueryParams, options: { replace?: boolean } = {}) => {
      if (typeof window === 'undefined') return

      const url = new URL(window.location.href)

      if (options.replace) {
        url.search = ''
      }

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          url.searchParams.delete(key)
        } else if (Array.isArray(value)) {
          url.searchParams.delete(key)
          value.forEach((v) => url.searchParams.append(key, v))
        } else {
          url.searchParams.set(key, value)
        }
      })

      window.history.pushState({}, '', url.toString())
      setParamsState(getQueryParams())
    },
    [getQueryParams]
  )

  const setQueryParam = useCallback(
    (key: string, value: string | undefined) => {
      setQueryParams({ [key]: value })
    },
    [setQueryParams]
  )

  const removeQueryParam = useCallback(
    (key: string) => {
      setQueryParams({ [key]: undefined })
    },
    [setQueryParams]
  )

  const clearQueryParams = useCallback(() => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    url.search = ''
    window.history.pushState({}, '', url.toString())
    setParamsState({})
  }, [])

  // Listen for popstate events (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setParamsState(getQueryParams())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [getQueryParams])

  return {
    params,
    setQueryParams,
    setQueryParam,
    removeQueryParam,
    clearQueryParams,
    getQueryParams,
  }
}

export function useQueryParam(key: string, defaultValue?: string): [string | undefined, (value: string | undefined) => void] {
  const { params, setQueryParam } = useQueryParams()
  const value = (params[key] as string) || defaultValue

  const setValue = useCallback(
    (newValue: string | undefined) => {
      setQueryParam(key, newValue)
    },
    [key, setQueryParam]
  )

  return [value, setValue]
}
