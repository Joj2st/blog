import { post } from '@/lib/request'
import { ApiResponse } from '@/lib/request'

export interface User {
  id: number
  email: string
  nickname: string
  avatar: string | null
  bio: string | null
  role: string
  status: string
  created_at: string
  updated_at: string
}

export interface Token {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface LoginResponse {
  user: User
  token: Token
}

export interface RegisterData {
  email: string
  password: string
  nickname: string
}

export interface LoginData {
  email: string
  password: string
}

export async function login(data: LoginData) {
  const response = await post<ApiResponse<LoginResponse>>('/v1/auth/login', data)
  return response.data
}

export async function register(data: RegisterData) {
  const response = await post<ApiResponse<LoginResponse>>('/v1/auth/register', data)
  return response.data
}

export async function forgotPassword(email: string) {
  const response = await post<ApiResponse<{ message: string }>>('/v1/auth/forgot-password', { email })
  return response.data
}

export async function resetPassword(data: {
  token: string
  password: string
  confirm_password: string
}) {
  const response = await post<ApiResponse<{ message: string }>>('/v1/auth/reset-password', data)
  return response.data
}
