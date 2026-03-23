import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
  loader: () => {
    const { auth } = useAuthStore.getState()
    
    // 检查用户是否已登录
    if (!auth.accessToken) {
      // 未登录，重定向到登录页面
      return redirect({ to: '/sign-in' })
    }
    
    return {}
  },
})
