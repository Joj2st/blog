import { get } from '@/lib/request'
import { ApiResponse } from '@/lib/request'

export interface DashboardStats {
  articles: {
    total: number
    published: number
    draft: number
    archived: number
    this_month: number
  }
  users: {
    total: number
    active: number
    this_month: number
  }
  comments: {
    total: number
    pending: number
    this_month: number
  }
  views: {
    today: number
    this_week: number
    this_month: number
  }
}

export interface TrafficItem {
  date: string
  pv: number
  uv: number
  ip: number
}

export interface TrafficSummary {
  total_pv: number
  total_uv: number
  avg_pv: number
  avg_uv: number
}

export interface TrafficStats {
  list: TrafficItem[]
  summary: TrafficSummary
}

export interface HotArticle {
  id: number
  title: string
  view_count: number
  like_count: number
  comment_count: number
}

export interface HotArticlesResponse {
  list: HotArticle[]
}

export async function getDashboardStats() {
  const response = await get<ApiResponse<DashboardStats>>('/v1/stats/dashboard')
  return response.data
}

export async function getTrafficStats(params: {
  start_date: string
  end_date: string
  type?: 'day' | 'week' | 'month'
}) {
  const response = await get<ApiResponse<TrafficStats>>('/v1/stats/traffic', params)
  return response.data
}

export async function getHotArticles(params?: {
  limit?: number
  type?: 'view' | 'like' | 'comment'
  start_date?: string
  end_date?: string
}) {
  const response = await get<ApiResponse<HotArticlesResponse>>('/v1/stats/hot-articles', params)
  return response.data
}
