import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { getSettings, updateSettings, Settings } from '@/services/setting-service'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SiteSettings,
})

function SiteSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    site_name: '',
    site_description: '',
    site_keywords: '',
    site_logo: '',
    site_favicon: '',
    site_icp: '',
    comment_enabled: true,
    comment_audit: true,
    register_enabled: true,
    email_notify: false,
    footer_text: '',
    social_links: {},
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await getSettings()
      if (data) {
        setSettings({
          site_name: data.site_name || '',
          site_description: data.site_description || '',
          site_keywords: data.site_keywords || '',
          site_logo: data.site_logo || '',
          site_favicon: data.site_favicon || '',
          site_icp: data.site_icp || '',
          comment_enabled: data.comment_enabled ?? true,
          comment_audit: data.comment_audit ?? true,
          register_enabled: data.register_enabled ?? true,
          email_notify: data.email_notify ?? false,
          footer_text: data.footer_text || '',
          social_links: data.social_links || {},
        })
      }
    } catch (error) {
      console.error('获取设置失败:', error)
      toast.error('获取设置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateSettings(settings)
      toast.success('设置保存成功')
    } catch (error) {
      console.error('保存设置失败:', error)
      toast.error('保存设置失败')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateSocialLink = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [key]: value },
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>站点信息</CardTitle>
          <CardDescription>配置网站基本信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">站点名称</Label>
            <Input
              id="site-name"
              placeholder="我的博客"
              value={settings.site_name}
              onChange={(e) => updateSetting('site_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-description">站点描述</Label>
            <Textarea
              id="site-description"
              placeholder="一个技术博客"
              value={settings.site_description}
              onChange={(e) => updateSetting('site_description', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-keywords">SEO关键词</Label>
            <Input
              id="site-keywords"
              placeholder="技术,博客,编程"
              value={settings.site_keywords}
              onChange={(e) => updateSetting('site_keywords', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-logo">站点Logo URL</Label>
            <Input
              id="site-logo"
              placeholder="https://example.com/logo.png"
              value={settings.site_logo || ''}
              onChange={(e) => updateSetting('site_logo', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-favicon">Favicon URL</Label>
            <Input
              id="site-favicon"
              placeholder="https://example.com/favicon.ico"
              value={settings.site_favicon || ''}
              onChange={(e) => updateSetting('site_favicon', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-icp">ICP备案号</Label>
            <Input
              id="site-icp"
              placeholder="京ICP备xxxxx号"
              value={settings.site_icp || ''}
              onChange={(e) => updateSetting('site_icp', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>功能设置</CardTitle>
          <CardDescription>配置网站功能开关</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>开启评论</Label>
              <p className="text-sm text-muted-foreground">允许用户发表评论</p>
            </div>
            <Switch
              checked={settings.comment_enabled}
              onCheckedChange={(checked) => updateSetting('comment_enabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>评论审核</Label>
              <p className="text-sm text-muted-foreground">评论需要审核后才能显示</p>
            </div>
            <Switch
              checked={settings.comment_audit}
              onCheckedChange={(checked) => updateSetting('comment_audit', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>开放注册</Label>
              <p className="text-sm text-muted-foreground">允许用户注册账号</p>
            </div>
            <Switch
              checked={settings.register_enabled}
              onCheckedChange={(checked) => updateSetting('register_enabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>邮件通知</Label>
              <p className="text-sm text-muted-foreground">发送邮件通知用户</p>
            </div>
            <Switch
              checked={settings.email_notify}
              onCheckedChange={(checked) => updateSetting('email_notify', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>社交链接</CardTitle>
          <CardDescription>配置社交媒体链接</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              placeholder="https://github.com/xxx"
              value={settings.social_links?.github || ''}
              onChange={(e) => updateSocialLink('github', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              placeholder="https://twitter.com/xxx"
              value={settings.social_links?.twitter || ''}
              onChange={(e) => updateSocialLink('twitter', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weibo">微博</Label>
            <Input
              id="weibo"
              placeholder="https://weibo.com/xxx"
              value={settings.social_links?.weibo || ''}
              onChange={(e) => updateSocialLink('weibo', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              placeholder="your@email.com"
              value={settings.social_links?.email || ''}
              onChange={(e) => updateSocialLink('email', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>页脚设置</CardTitle>
          <CardDescription>配置网站页脚信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footer-text">页脚文字</Label>
            <Textarea
              id="footer-text"
              placeholder="Copyright © 2024"
              value={settings.footer_text || ''}
              onChange={(e) => updateSetting('footer_text', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              保存设置
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
