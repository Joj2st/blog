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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { createTag, updateTag, Tag, TagCreate } from '@/services/tag-service'

const formSchema = z.object({
  name: z.string().min(1, '标签名称不能为空').max(50, '标签名称不能超过50字符'),
  slug: z.string().max(50, 'URL别名不能超过50字符').optional(),
  color: z.string().max(20, '颜色值不能超过20字符').optional(),
})

type FormValues = z.infer<typeof formSchema>

interface TagFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag?: Tag | null
  onSuccess?: () => void
}

export function TagFormDialog({ open, onOpenChange, tag, onSuccess }: TagFormDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      color: '#3B82F6',
    },
  })

  const isEdit = !!tag

  useEffect(() => {
    if (tag) {
      form.reset({
        name: tag.name || '',
        slug: tag.slug || '',
        color: tag.color || '#3B82F6',
      })
    } else {
      form.reset()
    }
  }, [tag, form])

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true)

      const data: TagCreate = {
        name: values.name,
        slug: values.slug,
        color: values.color || '#3B82F6',
      }

      if (isEdit && tag) {
        await updateTag(tag.id, data)
        toast.success('标签更新成功')
      } else {
        await createTag(data)
        toast.success('标签创建成功')
      }

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('保存标签失败:', error)
      toast.error(isEdit ? '更新标签失败' : '创建标签失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑标签' : '新增标签'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改标签信息' : '填写标签信息创建新标签'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标签名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入标签名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL别名</FormLabel>
                  <FormControl>
                    <Input placeholder="tag-slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标签颜色</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input type="color" className="w-12 h-10 p-1" {...field} />
                    </FormControl>
                    <Input
                      placeholder="#3B82F6"
                      {...field}
                      className="flex-1"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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
