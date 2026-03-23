import { Outlet } from '@tanstack/react-router'
import { Settings as SettingsIcon } from 'lucide-react'
import { Page, PageHeader, PageHeaderBar, PageBody } from '@/components/page-header'
import { Separator } from '@/components/ui/separator'
import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems = [
  {
    title: '站点设置',
    href: '/settings',
    icon: <SettingsIcon size={18} />,
  },
  {
    title: '外观设置',
    href: '/settings/appearance',
    icon: null,
  },
  {
    title: '通知设置',
    href: '/settings/notifications',
    icon: null,
  },
]

export function Settings() {
  return (
    <Page>
      <PageHeaderBar>
        <PageHeader
          title="系统设置"
          description="管理博客系统配置"
        />
      </PageHeaderBar>
      <PageBody>
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </PageBody>
    </Page>
  )
}
