import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  component: NotificationSettings,
})

function NotificationSettings() {
  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>邮件通知</CardTitle>
          <CardDescription>配置系统邮件通知设置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>评论通知</Label>
              <p className="text-sm text-muted-foreground">有新评论时发送邮件通知</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>注册通知</Label>
              <p className="text-sm text-muted-foreground">有新用户注册时发送邮件通知</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>系统通知</Label>
              <p className="text-sm text-muted-foreground">接收系统重要通知邮件</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>保存设置</Button>
      </div>
    </div>
  )
}
