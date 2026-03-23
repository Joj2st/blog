import {
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  FolderTree,
  Tags,
  MessageSquare,
  Image,
  Bell,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: '博客系统',
      logo: LayoutDashboard,
      plan: '管理后台',
    },
  ],
  navGroups: [
    {
      title: '概览',
      items: [
        {
          title: '仪表盘',
          url: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: '内容管理',
      items: [
        {
          title: '文章管理',
          url: '/articles',
          icon: FileText,
        },
        {
          title: '分类管理',
          url: '/categories',
          icon: FolderTree,
        },
        {
          title: '标签管理',
          url: '/tags',
          icon: Tags,
        },
        {
          title: '评论管理',
          url: '/comments',
          icon: MessageSquare,
        },
        {
          title: '媒体管理',
          url: '/media',
          icon: Image,
        },
        {
          title: '弹窗管理',
          url: '/popups',
          icon: Bell,
        },
      ],
    },
    {
      title: '系统',
      items: [
        {
          title: '用户管理',
          url: '/users',
          icon: Users,
        },
        {
          title: '系统设置',
          url: '/settings',
          icon: Settings,
        },
      ],
    },
  ],
}
