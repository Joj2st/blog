import { get, post, put, del } from '@/lib/request'
import { ApiResponse } from '@/lib/request'

export interface Tag {
  id: number
  name: string
  slug: string
  color: string
  article_count: number
  created_at: string
}

export interface TagCreate {
  name: string
  slug?: string
  color?: string
}

export interface TagUpdate extends Partial<TagCreate> {}

export interface TagParams {
  skip?: number
  limit?: number
  order_by?: string
  order?: 'asc' | 'desc'
}

export async function getTags(params?: TagParams) {
  const response = await get<ApiResponse<Tag[]>>('/v1/tags', params)
  return response.data || []
}

export async function getTag(id: number) {
  const response = await get<ApiResponse<Tag>>(`/v1/tags/${id}`)
  return response.data
}

export async function createTag(data: TagCreate) {
  const response = await post<ApiResponse<Tag>>('/v1/tags', data)
  return response.data
}

export async function updateTag(id: number, data: TagUpdate) {
  const response = await put<ApiResponse<Tag>>(`/v1/tags/${id}`, data)
  return response.data
}

export async function deleteTag(id: number) {
  const response = await del<ApiResponse<null>>(`/v1/tags/${id}`)
  return response.data
}
