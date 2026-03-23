import { get, post, put, del } from '@/lib/request'
import { ApiResponse, PaginationParams } from '@/lib/request'

export interface AuthorInfo {
  id: number
  nickname: string
  avatar: string | null
}

export interface CategoryInfo {
  id: number
  name: string
  slug?: string
}

export interface TagInfo {
  id: number
  name: string
  slug?: string
}

export interface Article {
  id: number
  title: string
  slug: string
  summary: string | null
  content: string
  cover_image: string | null
  category: CategoryInfo | null
  tags: TagInfo[]
  author: AuthorInfo
  status: 'published' | 'draft' | 'archived'
  is_top: boolean
  is_featured: boolean
  view_count: number
  like_count: number
  comment_count: number
  published_at: string | null
  created_at: string
  updated_at: string | null
}

export interface ArticleListItem {
  id: number
  title: string
  slug: string
  summary: string | null
  cover_image: string | null
  category: CategoryInfo | null
  tags: TagInfo[]
  author: AuthorInfo
  status: 'published' | 'draft' | 'archived'
  is_top: boolean
  is_featured: boolean
  view_count: number
  like_count: number
  comment_count: number
  published_at: string | null
  created_at: string
}

export interface ArticlePagination {
  list: ArticleListItem[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}

export interface ArticleDetail extends Article {
  prev_article?: { id: number; title: string }
  next_article?: { id: number; title: string }
  related_articles?: { id: number; title: string; cover_image: string }[]
}

export interface ArticleCreate {
  title: string
  slug?: string
  summary?: string
  content: string
  cover_image?: string
  category_id: number
  tag_ids?: number[]
  status?: 'draft' | 'published'
  is_top?: boolean
  is_featured?: boolean
  published_at?: string
}

export interface ArticleUpdate extends Partial<ArticleCreate> {}

export interface ArticleParams extends PaginationParams {
  keyword?: string
  category_id?: number
  tag_id?: number
  status?: 'published' | 'draft' | 'archived'
  author_id?: number
  start_date?: string
  end_date?: string
  sort_by?: 'published_at' | 'view_count' | 'created_at'
  sort_order?: 'asc' | 'desc'
}

export async function getArticles(params?: ArticleParams) {
  const response = await get<ApiResponse<ArticlePagination>>('/v1/articles', params)
  return response.data
}

export async function getArticle(id: number) {
  const response = await get<ApiResponse<ArticleDetail>>(`/v1/articles/${id}`)
  return response.data
}

export async function createArticle(data: ArticleCreate) {
  const response = await post<ApiResponse<ArticleListItem>>('/v1/articles', data)
  return response.data
}

export async function updateArticle(id: number, data: ArticleUpdate) {
  const response = await put<ApiResponse<ArticleListItem>>(`/v1/articles/${id}`, data)
  return response.data
}

export async function deleteArticle(id: number) {
  const response = await del<ApiResponse<null>>(`/v1/articles/${id}`)
  return response.data
}

export async function likeArticle(id: number) {
  const response = await post<ApiResponse<{ like_count: number; is_liked: boolean }>>(`/v1/articles/${id}/like`)
  return response.data
}

export async function unlikeArticle(id: number) {
  const response = await del<ApiResponse<{ like_count: number; is_liked: boolean }>>(`/v1/articles/${id}/like`)
  return response.data
}
