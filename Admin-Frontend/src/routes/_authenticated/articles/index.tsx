import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { Page, PageHeader, PageHeaderBar, PageBody } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { ArticleFormDialog } from '@/components/article-form-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getArticles,
  getArticle,
  deleteArticle,
  ArticleListItem,
  ArticleDetail,
  ArticleParams,
} from '@/services/article-service'

export const Route = createFileRoute('/_authenticated/articles/')({
  component: ArticlesPage,
})

function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<ArticleListItem | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<ArticleDetail | null>(null)

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      const params: ArticleParams = {
        page,
        page_size: pageSize,
        keyword: searchQuery || undefined,
        sort_by: 'created_at',
        sort_order: 'desc',
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter as 'published' | 'draft' | 'archived'
      }

      const response = await getArticles(params)
      setArticles(response?.list || [])
      setTotal(response?.pagination?.total || 0)
    } catch (error) {
      console.error('获取文章列表失败:', error)
      setArticles([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchQuery, statusFilter])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const handleSearch = () => {
    setSearchQuery(searchInput)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  const handleAdd = () => {
    setEditingArticle(null)
    setFormDialogOpen(true)
  }

  const handleEdit = async (article: ArticleListItem) => {
    try {
      const articleDetail = await getArticle(article.id)
      setEditingArticle(articleDetail)
      setFormDialogOpen(true)
    } catch (error) {
      console.error('获取文章详情失败:', error)
    }
  }

  const handleDelete = (article: ArticleListItem) => {
    setSelectedArticle(article)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedArticle) return

    try {
      await deleteArticle(selectedArticle.id)
      setDeleteDialogOpen(false)
      setSelectedArticle(null)
      fetchArticles()
    } catch (error) {
      console.error('删除文章失败:', error)
    }
  }

  const handleFormSuccess = () => {
    fetchArticles()
  }

  const getStatusBadge = (status: ArticleListItem['status']) => {
    const statusMap: Record<string, { status: 'active' | 'inactive' | 'pending'; text: string }> = {
      published: { status: 'active', text: '已发布' },
      draft: { status: 'pending', text: '草稿' },
      archived: { status: 'inactive', text: '已归档' },
    }
    const config = statusMap[status]
    return <StatusBadge status={config.status} text={config.text} />
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  return (
    <Page>
      <PageHeaderBar>
        <PageHeader
          title="文章管理"
          description="管理系统文章和内容"
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
                    placeholder="搜索文章标题..."
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="全部状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="archived">已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                新增文章
              </Button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : articles.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>标题</TableHead>
                      <TableHead>作者</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>浏览量</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell>{article.author?.nickname || '-'}</TableCell>
                        <TableCell>{article.category?.name || '-'}</TableCell>
                        <TableCell>{getStatusBadge(article.status)}</TableCell>
                        <TableCell>{article.view_count}</TableCell>
                        <TableCell>{formatDate(article.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(article)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(article)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              onClick={() => setPage(p)}
                              isActive={page === p}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="暂无文章"
                description="开始创建您的第一篇文章"
                action={{
                  label: '新增文章',
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
        description={`确定要删除文章 "${selectedArticle?.title}" 吗？此操作不可撤销。`}
        onConfirm={confirmDelete}
        variant="destructive"
      />

      <ArticleFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        article={editingArticle}
        onSuccess={handleFormSuccess}
      />
    </Page>
  )
}
