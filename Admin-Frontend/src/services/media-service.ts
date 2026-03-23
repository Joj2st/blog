import { get, post, del } from '@/lib/request'
import { ApiResponse } from '@/lib/request'

export interface Media {
  id: number
  filename: string
  original_name: string
  path: string
  url: string
  mime_type: string
  size: number
  width: number | null
  height: number | null
  uploader?: {
    id: number
    nickname: string
  }
  created_at: string
}

export interface MediaPagination {
  list: Media[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}

export interface MediaParams {
  page?: number
  page_size?: number
  type?: 'image' | 'document'
  keyword?: string
  start_date?: string
  end_date?: string
}

export interface UploadResponse {
  id: number
  filename: string
  original_name: string
  path: string
  url: string
  mime_type: string
  size: number
  width: number | null
  height: number | null
  created_at: string
}

export async function getMediaList(params?: MediaParams) {
  const response = await get<ApiResponse<MediaPagination>>('/v1/media', params)
  return response.data
}

export async function getMedia(id: number) {
  const response = await get<ApiResponse<Media>>(`/v1/media/${id}`)
  return response.data
}

export async function uploadFile(file: File, type: 'image' | 'document' = 'image') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)

  const response = await post<ApiResponse<UploadResponse>>('/v1/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export async function deleteMedia(id: number) {
  const response = await del<ApiResponse<null>>(`/v1/media/${id}`)
  return response.data
}

export async function batchDeleteMedia(ids: number[]) {
  const response = await post<ApiResponse<{ success_count: number; failed_count: number }>>('/v1/media/batch-delete', { ids })
  return response.data
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'xls'
  if (mimeType.includes('video/')) return 'video'
  if (mimeType.includes('audio/')) return 'audio'
  return 'file'
}
