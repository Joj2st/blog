import { get, put } from '@/lib/request'
import { ApiResponse } from '@/lib/request'

export interface Settings {
  site_name: string
  site_description: string
  site_keywords: string
  site_logo: string | null
  site_favicon: string | null
  site_icp: string | null
  comment_enabled: boolean
  comment_audit: boolean
  register_enabled: boolean
  email_notify: boolean
  footer_text: string | null
  social_links: {
    github?: string
    twitter?: string
    weibo?: string
    email?: string
  }
}

export interface SettingsUpdate extends Partial<Settings> {}

export async function getSettings() {
  const response = await get<ApiResponse<Settings>>('/v1/settings')
  return response.data
}

export async function updateSettings(data: SettingsUpdate) {
  const response = await put<ApiResponse<Settings>>('/v1/settings', data)
  return response.data
}
