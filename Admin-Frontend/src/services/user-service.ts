import { get, post, put, del } from '@/lib/request'
import { ApiResponse } from '@/lib/request'

export interface User {
  id: number
  email: string
  nickname: string
  avatar: string | null
  bio: string | null
  role: 'user' | 'author' | 'admin'
  status: 'active' | 'inactive' | 'banned'
  article_count: number
  comment_count: number
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface UserPagination {
  list: User[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}

export interface UserParams {
  page?: number
  page_size?: number
  keyword?: string
  role?: 'user' | 'author' | 'admin'
  status?: 'active' | 'inactive' | 'banned'
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface UserUpdate {
  nickname?: string
  role?: 'user' | 'author' | 'admin'
  status?: 'active' | 'inactive' | 'banned'
  bio?: string
  avatar?: string
}

export async function getUsers(params?: UserParams) {
  const response = await get<ApiResponse<UserPagination>>('/v1/users', params)
  return response.data
}

export async function getUser(id: number) {
  const response = await get<ApiResponse<User>>(`/v1/users/${id}`)
  return response.data
}

export async function updateUser(id: number, data: UserUpdate) {
  const response = await put<ApiResponse<User>>(`/v1/users/${id}`, data)
  return response.data
}

export async function deleteUser(id: number) {
  const response = await del<ApiResponse<null>>(`/v1/users/${id}`)
  return response.data
}

export async function batchDeleteUsers(ids: number[]) {
  const response = await post<ApiResponse<{ success_count: number; failed_count: number }>>('/v1/users/batch-delete', { ids })
  return response.data
}

export function getRoleLabel(role: string): string {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    author: '作者',
    user: '用户',
  }
  return roleMap[role] || role
}

export function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    active: '正常',
    inactive: '未激活',
    banned: '已禁用',
  }
  return statusMap[status] || status
}
