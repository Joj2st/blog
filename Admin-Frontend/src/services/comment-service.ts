import { get, post, put, del } from '@/lib/request'
import { ApiResponse } from '@/lib/request'

export type CommentStatus = 'pending' | 'approved' | 'spam' | 'trash'

export interface CommentUser {
  id: number
  nickname: string
  avatar: string | null
}

export interface ArticleInfo {
  id: number
  title: string
}

export interface Comment {
  id: number
  article_id: number
  user_id: number
  parent_id: number | null
  content: string
  status: CommentStatus
  like_count: number
  created_at: string
  updated_at: string | null
  user: CommentUser
  article: ArticleInfo
}

export interface CommentPagination {
  list: Comment[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}

export interface CommentParams {
  page?: number
  page_size?: number
  status?: CommentStatus
  keyword?: string
  article_id?: number
}

export async function getComments(params?: CommentParams) {
  const response = await get<ApiResponse<CommentPagination>>('/v1/comments', params)
  return response.data
}

export async function getComment(id: number) {
  const response = await get<ApiResponse<Comment>>(`/v1/comments/${id}`)
  return response.data
}

export async function updateCommentStatus(id: number, status: CommentStatus) {
  const response = await put<ApiResponse<Comment>>(`/v1/comments/${id}/status`, null, {
    params: { status }
  })
  return response.data
}

export async function deleteComment(id: number) {
  const response = await del<ApiResponse<null>>(`/v1/comments/${id}`)
  return response.data
}

export function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    spam: '垃圾',
    trash: '回收站',
  }
  return statusMap[status] || status
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    spam: 'bg-red-100 text-red-700',
    trash: 'bg-gray-100 text-gray-700',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-700'
}
