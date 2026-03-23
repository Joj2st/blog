export * from './auth-store'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// App store for global UI state
interface AppState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'app-storage',
    }
  )
)

// User store for user-related state
interface UserState {
  user: User | null
  permissions: string[]
  setUser: (user: User | null) => void
  setPermissions: (permissions: string[]) => void
  hasPermission: (permission: string) => boolean
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

export const useUserStore = create<UserState>()((set, get) => ({
  user: null,
  permissions: [],
  setUser: (user) => set({ user }),
  setPermissions: (permissions) => set({ permissions }),
  hasPermission: (permission) => {
    const { permissions } = get()
    return permissions.includes(permission) || permissions.includes('*')
  },
}))

// Settings store for user preferences
interface SettingsState {
  language: string
  timezone: string
  dateFormat: string
  setLanguage: (language: string) => void
  setTimezone: (timezone: string) => void
  setDateFormat: (format: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      dateFormat: 'yyyy-MM-dd',
      setLanguage: (language) => set({ language }),
      setTimezone: (timezone) => set({ timezone }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
    }),
    {
      name: 'settings-storage',
    }
  )
)
