import { get, post, put, del } from '@/lib/request'
import { ApiResponse } from '@/lib/request'

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  parent_id: number | null
  sort_order: number
  article_count: number
  children?: Category[]
  created_at: string
}

export interface CategoryCreate {
  name: string
  slug?: string
  description?: string
  parent_id?: number
  sort_order?: number
}

export interface CategoryUpdate extends Partial<CategoryCreate> {}

export interface CategoryParams {
  parent_id?: number
  skip?: number
  limit?: number
}

export async function getCategories(params?: CategoryParams) {
  const response = await get<ApiResponse<Category[]>>('/v1/categories', params)
  return response.data || []
}

export async function getCategory(id: number) {
  const response = await get<ApiResponse<Category>>(`/v1/categories/${id}`)
  return response.data
}

export async function createCategory(data: CategoryCreate) {
  const response = await post<ApiResponse<Category>>('/v1/categories', data)
  return response.data
}

export async function updateCategory(id: number, data: CategoryUpdate) {
  const response = await put<ApiResponse<Category>>(`/v1/categories/${id}`, data)
  return response.data
}

export async function deleteCategory(id: number) {
  const response = await del<ApiResponse<null>>(`/v1/categories/${id}`)
  return response.data
}
