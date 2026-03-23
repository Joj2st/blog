import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Page, PageHeader, PageHeaderBar, PageBody } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { TagFormDialog } from '@/components/tag-form-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getTags,
  deleteTag,
  Tag,
  TagParams,
} from '@/services/tag-service'

export const Route = createFileRoute('/_authenticated/tags/')({
  component: TagsPage,
})

function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true)
      const params: TagParams = {
        limit: 100,
        order_by: 'article_count',
        order: 'desc',
      }

      const response = await getTags(params)
      setTags(response || [])
    } catch (error) {
      console.error('获取标签列表失败:', error)
      setTags([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const handleSearch = () => {
    setSearchQuery(searchInput)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleAdd = () => {
    setEditingTag(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    setFormDialogOpen(true)
  }

  const handleDelete = (tag: Tag) => {
    setSelectedTag(tag)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedTag) return

    try {
      await deleteTag(selectedTag.id)
      setDeleteDialogOpen(false)
      setSelectedTag(null)
      fetchTags()
    } catch (error) {
      console.error('删除标签失败:', error)
    }
  }

  const handleFormSuccess = () => {
    fetchTags()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const filteredTags = searchQuery
    ? tags.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tags

  return (
    <Page>
      <PageHeaderBar>
        <PageHeader
          title="标签管理"
          description="管理文章标签"
        />
      </PageHeaderBar>
      <PageBody>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索标签..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-9 pr-20"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSearch}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                  >
                    搜索
                  </Button>
                </div>
              </div>
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                新增标签
              </Button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : filteredTags.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标签名称</TableHead>
                    <TableHead>URL别名</TableHead>
                    <TableHead>颜色</TableHead>
                    <TableHead>文章数</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color || '#3B82F6' }}
                          />
                          {tag.name}
                        </div>
                      </TableCell>
                      <TableCell>{tag.slug || '-'}</TableCell>
                      <TableCell>
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: tag.color || '#3B82F6',
                            color: '#fff',
                          }}
                        >
                          {tag.color || '#3B82F6'}
                        </span>
                      </TableCell>
                      <TableCell>{tag.article_count || 0}</TableCell>
                      <TableCell>{formatDate(tag.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(tag)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tag)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="暂无标签"
                description="开始创建您的第一个标签"
                action={{
                  label: '新增标签',
                  onClick: handleAdd,
                }}
              />
            )}
          </CardContent>
        </Card>
      </PageBody>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description={`确定要删除标签 "${selectedTag?.name}" 吗？此操作不可撤销。`}
        onConfirm={confirmDelete}
        variant="destructive"
      />

      <TagFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        tag={editingTag}
        onSuccess={handleFormSuccess}
      />
    </Page>
  )
}
