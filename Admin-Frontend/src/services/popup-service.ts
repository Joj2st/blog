import { get, post, put, del } from '@/lib/request'
import { ApiResponse } from '@/lib/request'

export type PopupType = 'notification' | 'advertisement'
export type PopupStatus = 'active' | 'inactive' | 'expired'
export type ShowFrequency = 'once' | 'daily' | 'always'

export interface Popup {
  id: number
  title: string
  content: string
  type: PopupType
  status: PopupStatus
  image_url: string | null
  link_url: string | null
  start_time: string | null
  end_time: string | null
  show_frequency: ShowFrequency
  max_show_count: number | null
  current_show_count: number
  max_click_count: number | null
  current_click_count: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PopupPagination {
  list: Popup[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}

export interface PopupParams {
  page?: number
  page_size?: number
  type?: PopupType
  status?: PopupStatus
  keyword?: string
}

export interface PopupCreate {
  title: string
  content: string
  type: PopupType
  status?: PopupStatus
  image_url?: string
  link_url?: string
  start_time?: string
  end_time?: string
  show_frequency?: ShowFrequency
  max_show_count?: number
  max_click_count?: number
  sort_order?: number
}

export interface PopupUpdate extends Partial<PopupCreate> {}

export async function getPopups(params?: PopupParams) {
  const response = await get<ApiResponse<PopupPagination>>('/v1/popups', params)
  return response.data
}

export async function getPopup(id: number) {
  const response = await get<ApiResponse<Popup>>(`/v1/popups/${id}`)
  return response.data
}

export async function getActivePopups(type?: PopupType) {
  const response = await get<ApiResponse<Popup[]>>('/v1/popups/active', type ? { type } : undefined)
  return response.data
}

export async function createPopup(data: PopupCreate) {
  const response = await post<ApiResponse<Popup>>('/v1/popups', data)
  return response.data
}

export async function updatePopup(id: number, data: PopupUpdate) {
  const response = await put<ApiResponse<Popup>>(`/v1/popups/${id}`, data)
  return response.data
}

export async function deletePopup(id: number) {
  const response = await del<ApiResponse<null>>(`/v1/popups/${id}`)
  return response.data
}

export async function batchDeletePopups(ids: number[]) {
  const response = await post<ApiResponse<{ success_count: number; failed_count: number }>>('/v1/popups/batch-delete', { ids })
  return response.data
}

export async function recordPopupShow(id: number) {
  const response = await post<ApiResponse<null>>(`/v1/popups/${id}/show`)
  return response.data
}

export async function recordPopupClick(id: number) {
  const response = await post<ApiResponse<null>>(`/v1/popups/${id}/click`)
  return response.data
}

export async function updatePopupSort(items: { id: number; sort_order: number }[]) {
  const response = await put<ApiResponse<null>>('/v1/popups/sort', { items })
  return response.data
}

export function getTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    notification: '通知',
    advertisement: '广告',
  }
  return typeMap[type] || type
}

export function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    active: '启用',
    inactive: '禁用',
    expired: '已过期',
  }
  return statusMap[status] || status
}

export function getFrequencyLabel(frequency: string): string {
  const frequencyMap: Record<string, string> = {
    once: '仅一次',
    daily: '每天',
    always: '每次',
  }
  return frequencyMap[frequency] || frequency
}
