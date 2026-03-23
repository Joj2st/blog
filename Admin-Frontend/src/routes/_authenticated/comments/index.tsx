import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Search, Trash2, Check, X, AlertTriangle, MessageSquare } from 'lucide-react'
import { Page, PageHeader, PageHeaderBar, PageBody } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  getComments,
  deleteComment,
  updateCommentStatus,
  getStatusLabel,
  getStatusColor,
  Comment,
  CommentParams,
  CommentStatus,
} from '@/services/comment-service'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/comments/')({
  component: CommentsPage,
})

function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      const params: CommentParams = {
        page,
        page_size: pageSize,
        keyword: searchQuery || undefined,
        status: statusFilter !== 'all' ? (statusFilter as CommentStatus) : undefined,
      }

      const response = await getComments(params)
      setComments(response?.list || [])
      setTotal(response?.pagination?.total || 0)
    } catch (error) {
      console.error('获取评论列表失败:', error)
      setComments([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchQuery, statusFilter])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setPage(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  const handleDelete = (comment: Comment) => {
    setSelectedComment(comment)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedComment) return

    try {
      await deleteComment(selectedComment.id)
      setDeleteDialogOpen(false)
      setSelectedComment(null)
      fetchComments()
      toast.success('删除成功')
    } catch (error) {
      console.error('删除评论失败:', error)
      toast.error('删除失败')
    }
  }

  const handleStatusChange = async (comment: Comment, status: CommentStatus) => {
    try {
      await updateCommentStatus(comment.id, status)
      fetchComments()
      toast.success('状态更新成功')
    } catch (error) {
      console.error('更新状态失败:', error)
      toast.error('更新状态失败')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  return (
    <Page>
      <PageHeaderBar>
        <PageHeader
          title="评论管理"
          description="审核和管理用户评论"
        />
      </PageHeaderBar>
      <PageBody>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索评论内容..."
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
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="approved">已通过</SelectItem>
                  <SelectItem value="spam">垃圾</SelectItem>
                  <SelectItem value="trash">回收站</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : comments.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead>用户</TableHead>
                      <TableHead>评论内容</TableHead>
                      <TableHead>所属文章</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>点赞</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comments.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell className="font-mono text-sm">{comment.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {comment.user.avatar ? (
                              <img
                                src={comment.user.avatar}
                                alt={comment.user.nickname}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{comment.user.nickname}</div>
                              <div className="text-xs text-muted-foreground">ID: {comment.user.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm">{truncateContent(comment.content)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <p className="text-sm truncate" title={comment.article.title}>
                              {comment.article.title}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(comment.status)}`}>
                            {getStatusLabel(comment.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{comment.like_count}</TableCell>
                        <TableCell className="text-sm">{formatDate(comment.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {comment.status !== 'approved' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(comment, 'approved')}
                                title="通过"
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {comment.status !== 'spam' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(comment, 'spam')}
                                title="标记为垃圾"
                              >
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              </Button>
                            )}
                            {comment.status !== 'trash' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(comment, 'trash')}
                                title="移至回收站"
                              >
                                <X className="h-4 w-4 text-gray-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(comment)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
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
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let p: number
                          if (totalPages <= 5) {
                            p = i + 1
                          } else if (page <= 3) {
                            p = i + 1
                          } else if (page >= totalPages - 2) {
                            p = totalPages - 4 + i
                          } else {
                            p = page - 2 + i
                          }
                          return (
                            <PaginationItem key={p}>
                              <PaginationLink
                                onClick={() => setPage(p)}
                                isActive={page === p}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })}
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
                title="暂无评论"
                description="还没有用户评论"
              />
            )}
          </CardContent>
        </Card>
      </PageBody>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description={`确定要删除这条评论吗？此操作不可撤销。`}
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </Page>
  )
}
