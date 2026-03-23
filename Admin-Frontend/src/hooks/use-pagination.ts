import { useState, useCallback, useMemo } from 'react'

interface UsePaginationOptions {
  defaultPage?: number
  defaultPageSize?: number
  pageSizeOptions?: number[]
}

interface UsePaginationReturn {
  page: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  resetPagination: () => void
  pageSizeOptions: number[]
  paginationState: {
    pageIndex: number
    pageSize: number
  }
  onPaginationChange: (updater: { pageIndex: number; pageSize: number }) => void
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
  } = options

  const [page, setPageState] = useState(defaultPage)
  const [pageSize, setPageSizeState] = useState(defaultPageSize)

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, newPage))
  }, [])

  const setPageSize = useCallback((newPageSize: number) => {
    setPageSizeState(newPageSize)
    setPageState(1) // Reset to first page when page size changes
  }, [])

  const resetPagination = useCallback(() => {
    setPageState(defaultPage)
    setPageSizeState(defaultPageSize)
  }, [defaultPage, defaultPageSize])

  const paginationState = useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize,
    }),
    [page, pageSize]
  )

  const onPaginationChange = useCallback(
    (updater: { pageIndex: number; pageSize: number }) => {
      setPageState(updater.pageIndex + 1)
      setPageSizeState(updater.pageSize)
    },
    []
  )

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    resetPagination,
    pageSizeOptions,
    paginationState,
    onPaginationChange,
  }
}

interface UsePaginatedDataOptions<T> {
  data: T[]
  page?: number
  pageSize?: number
}

interface UsePaginatedDataReturn<T> {
  paginatedData: T[]
  total: number
  totalPages: number
  startIndex: number
  endIndex: number
}

export function usePaginatedData<T>(
  options: UsePaginatedDataOptions<T>
): UsePaginatedDataReturn<T> {
  const { data, page = 1, pageSize = 10 } = options

  const total = data.length
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, total)

  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex)
  }, [data, startIndex, endIndex])

  return {
    paginatedData,
    total,
    totalPages,
    startIndex,
    endIndex,
  }
}
