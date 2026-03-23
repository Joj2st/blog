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
import { createCategory, updateCategory, Category, CategoryCreate } from '@/services/category-service'

const formSchema = z.object({
  name: z.string().min(1, '分类名称不能为空').max(50, '分类名称不能超过50字符'),
  slug: z.string().max(50, 'URL别名不能超过50字符').optional(),
  description: z.string().max(200, '描述不能超过200字符').optional(),
  parent_id: z.number().optional(),
  sort_order: z.number().min(0, '排序值不能小于0').optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  categories?: Category[]
  onSuccess?: () => void
}

export function CategoryFormDialog({ open, onOpenChange, category, categories = [], onSuccess }: CategoryFormDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parent_id: undefined,
      sort_order: 0,
    },
  })

  const isEdit = !!category

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parent_id: category.parent_id || undefined,
        sort_order: category.sort_order || 0,
      })
    } else {
      form.reset()
    }
  }, [category, form])

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true)

      const data: CategoryCreate = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        parent_id: values.parent_id,
        sort_order: values.sort_order || 0,
      }

      if (isEdit && category) {
        await updateCategory(category.id, data)
        toast.success('分类更新成功')
      } else {
        await createCategory(data)
        toast.success('分类创建成功')
      }

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('保存分类失败:', error)
      toast.error(isEdit ? '更新分类失败' : '创建分类失败')
    } finally {
      setLoading(false)
    }
  }

  const parentCategories = categories.filter(c => c.id !== category?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑分类' : '新增分类'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改分类信息' : '填写分类信息创建新分类'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入分类名称" {...field} />
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
                    <Input placeholder="category-slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea placeholder="分类描述" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>父分类</FormLabel>
                  <Select
                    value={field.value?.toString() || 'none'}
                    onValueChange={(value) => field.onChange(value === 'none' ? undefined : parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择父分类" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">无（顶级分类）</SelectItem>
                      {parentCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>排序值</FormLabel>
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
