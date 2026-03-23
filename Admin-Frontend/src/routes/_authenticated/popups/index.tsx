import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2, Bell, Megaphone } from 'lucide-react'
import { Page, PageHeader, PageHeaderBar, PageBody } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { PopupFormDialog } from '@/components/popup-form-dialog'
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
  getPopups,
  deletePopup,
  batchDeletePopups,
  getTypeLabel,
  getStatusLabel,
  getFrequencyLabel,
  Popup,
  PopupParams,
} from '@/services/popup-service'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/popups/')({
  component: PopupsPage,
})

function PopupsPage() {
  const [popups, setPopups] = useState<Popup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const fetchPopups = useCallback(async () => {
    try {
      setLoading(true)
      const params: PopupParams = {
        page,
        page_size: pageSize,
        keyword: searchQuery || undefined,
        type: typeFilter !== 'all' ? (typeFilter as 'notification' | 'advertisement') : undefined,
        status: statusFilter !== 'all' ? (statusFilter as 'active' | 'inactive' | 'expired') : undefined,
      }

      const response = await getPopups(params)
      setPopups(response?.list || [])
      setTotal(response?.pagination?.total || 0)
    } catch (error) {
      console.error('获取弹窗列表失败:', error)
      setPopups([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchQuery, typeFilter, statusFilter])

  useEffect(() => {
    fetchPopups()
  }, [fetchPopups])

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

  const handleEdit = (popup: Popup) => {
    setEditingPopup(popup)
    setFormDialogOpen(true)
  }

  const handleDelete = (popup: Popup) => {
    setSelectedPopup(popup)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedPopup) return

    try {
      await deletePopup(selectedPopup.id)
      setDeleteDialogOpen(false)
      setSelectedPopup(null)
      fetchPopups()
      toast.success('删除成功')
    } catch (error) {
      console.error('删除弹窗失败:', error)
      toast.error('删除失败')
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return

    try {
      await batchDeletePopups(selectedIds)
      setSelectedIds([])
      fetchPopups()
      toast.success('批量删除成功')
    } catch (error) {
      console.error('批量删除失败:', error)
      toast.error('批量删除失败')
    }
  }

  const handleFormSuccess = () => {
    fetchPopups()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getTypeBadgeClass = (type: string) => {
    const classes: Record<string, string> = {
      notification: 'bg-blue-100 text-blue-700',
      advertisement: 'bg-purple-100 text-purple-700',
    }
    return classes[type] || 'bg-gray-100 text-gray-700'
  }

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-yellow-100 text-yellow-700',
      expired: 'bg-red-100 text-red-700',
    }
    return classes[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <Page>
      <PageHeaderBar>
        <PageHeader
          title="弹窗管理"
          description="管理系统弹窗通知和广告"
          actions={
            <Button onClick={() => { setEditingPopup(null); setFormDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              新增弹窗
            </Button>
          }
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
                    placeholder="搜索弹窗标题..."
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
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="全部类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="notification">通知</SelectItem>
                    <SelectItem value="advertisement">广告</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="全部状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="active">启用</SelectItem>
                    <SelectItem value="inactive">禁用</SelectItem>
                    <SelectItem value="expired">已过期</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedIds.length > 0 && (
                <Button variant="destructive" onClick={handleBatchDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除选中 ({selectedIds.length})
                </Button>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : popups.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === popups.length && popups.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(popups.map(p => p.id))
                            } else {
                              setSelectedIds([])
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>标题</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>展示频率</TableHead>
                      <TableHead>展示/点击</TableHead>
                      <TableHead>展示时间</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {popups.map((popup) => (
                      <TableRow key={popup.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(popup.id)}
                            onChange={() => toggleSelect(popup.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {popup.type === 'notification' ? (
                              <Bell className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Megaphone className="h-4 w-4 text-purple-500" />
                            )}
                            <span className="font-medium">{popup.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${getTypeBadgeClass(popup.type)}`}>
                            {getTypeLabel(popup.type)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(popup.status)}`}>
                            {getStatusLabel(popup.status)}
                          </span>
                        </TableCell>
                        <TableCell>{getFrequencyLabel(popup.show_frequency)}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {popup.current_show_count}
                            {popup.max_show_count ? `/${popup.max_show_count}` : ''}
                            {' / '}
                            {popup.current_click_count}
                            {popup.max_click_count ? `/${popup.max_click_count}` : ''}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>{formatDate(popup.start_time)}</div>
                          <div className="text-muted-foreground">至 {formatDate(popup.end_time)}</div>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(popup.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(popup)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(popup)}
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
                title="暂无弹窗"
                description="开始添加第一个弹窗"
                action={{
                  label: '新增弹窗',
                  onClick: () => { setEditingPopup(null); setFormDialogOpen(true); },
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
        description={`确定要删除弹窗 "${selectedPopup?.title}" 吗？此操作不可撤销。`}
        onConfirm={confirmDelete}
        variant="destructive"
      />

      <PopupFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        popup={editingPopup}
        onSuccess={handleFormSuccess}
      />
    </Page>
  )
}
