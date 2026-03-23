import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createPopup, updatePopup, Popup, PopupCreate, PopupType, PopupStatus, ShowFrequency } from '@/services/popup-service'

const formSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100字符'),
  content: z.string().min(1, '内容不能为空'),
  type: z.enum(['notification', 'advertisement']),
  status: z.enum(['active', 'inactive']),
  image_url: z.string().url('请输入有效的URL').optional().or(z.literal('')),
  link_url: z.string().url('请输入有效的URL').optional().or(z.literal('')),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  show_frequency: z.enum(['once', 'daily', 'always']),
  max_show_count: z.number().min(0).optional().nullable(),
  max_click_count: z.number().min(0).optional().nullable(),
  sort_order: z.number().min(0),
})

type FormValues = z.infer<typeof formSchema>

interface PopupFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  popup?: Popup | null
  onSuccess: () => void
}

export function PopupFormDialog({ open, onOpenChange, popup, onSuccess }: PopupFormDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'notification',
      status: 'active',
      image_url: '',
      link_url: '',
      start_time: '',
      end_time: '',
      show_frequency: 'once',
      max_show_count: null,
      max_click_count: null,
      sort_order: 0,
    },
  })

  useEffect(() => {
    if (popup) {
      form.reset({
        title: popup.title,
        content: popup.content,
        type: popup.type,
        status: popup.status as PopupStatus,
        image_url: popup.image_url || '',
        link_url: popup.link_url || '',
        start_time: popup.start_time ? popup.start_time.slice(0, 16) : '',
        end_time: popup.end_time ? popup.end_time.slice(0, 16) : '',
        show_frequency: popup.show_frequency,
        max_show_count: popup.max_show_count,
        max_click_count: popup.max_click_count,
        sort_order: popup.sort_order,
      })
    } else {
      form.reset({
        title: '',
        content: '',
        type: 'notification',
        status: 'active',
        image_url: '',
        link_url: '',
        start_time: '',
        end_time: '',
        show_frequency: 'once',
        max_show_count: null,
        max_click_count: null,
        sort_order: 0,
      })
    }
  }, [popup, form])

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true)

      const data: PopupCreate = {
        title: values.title,
        content: values.content,
        type: values.type as PopupType,
        status: values.status as PopupStatus,
        image_url: values.image_url || undefined,
        link_url: values.link_url || undefined,
        start_time: values.start_time ? new Date(values.start_time).toISOString() : undefined,
        end_time: values.end_time ? new Date(values.end_time).toISOString() : undefined,
        show_frequency: values.show_frequency as ShowFrequency,
        max_show_count: values.max_show_count || undefined,
        max_click_count: values.max_click_count || undefined,
        sort_order: values.sort_order,
      }

      if (popup) {
        await updatePopup(popup.id, data)
        toast.success('更新成功')
      } else {
        await createPopup(data)
        toast.success('创建成功')
      }

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('保存失败:', error)
      toast.error(popup ? '更新失败' : '创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{popup ? '编辑弹窗' : '新增弹窗'}</DialogTitle>
          <DialogDescription>
            {popup ? '修改弹窗信息' : '创建一个新的弹窗'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标题</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入弹窗标题" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>内容</FormLabel>
                  <FormControl>
                    <Textarea placeholder="请输入弹窗内容" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>类型</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="notification">通知</SelectItem>
                        <SelectItem value="advertisement">广告</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择状态" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">启用</SelectItem>
                        <SelectItem value="inactive">禁用</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>图片URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>跳转链接</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/page" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>开始时间</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>结束时间</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="show_frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>展示频率</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择展示频率" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="once">仅一次</SelectItem>
                      <SelectItem value="daily">每天</SelectItem>
                      <SelectItem value="always">每次</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="max_show_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>最大展示次数</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="不限制"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value ? parseInt(value) : null)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_click_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>最大点击次数</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="不限制"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value ? parseInt(value) : null)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>排序权重</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '保存中...' : '保存'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
