import { ReactNode } from 'react'
import { useUserStore } from '@/stores'

interface PermissionGuardProps {
  children: ReactNode
  permission?: string
  permissions?: string[]
  fallback?: ReactNode
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission } = useUserStore()

  const hasAccess = () => {
    if (!permission && !permissions) return true
    if (permission) return hasPermission(permission)
    if (permissions) return permissions.some((p) => hasPermission(p))
    return false
  }

  if (!hasAccess()) {
    return fallback
  }

  return <>{children}</>
}

interface RoleGuardProps {
  children: ReactNode
  role?: string
  roles?: string[]
  fallback?: ReactNode
}

export function RoleGuard({
  children,
  role,
  roles,
  fallback = null,
}: RoleGuardProps) {
  const { user } = useUserStore()

  const hasAccess = () => {
    if (!role && !roles) return true
    if (!user) return false
    if (role) return user.role === role
    if (roles) return roles.includes(user.role)
    return false
  }

  if (!hasAccess()) {
    return fallback
  }

  return <>{children}</>
}

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AuthGuard({ children, fallback = null }: AuthGuardProps) {
  const { user } = useUserStore()

  if (!user) {
    return fallback
  }

  return <>{children}</>
}
