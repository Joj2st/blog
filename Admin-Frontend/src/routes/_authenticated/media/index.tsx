import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Upload, Search, Trash2, Image as ImageIcon, File, Copy, Check } from 'lucide-react'
import { Page, PageHeader, PageHeaderBar, PageBody } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
import { UploadDialog } from '@/components/upload-dialog'
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
  getMediaList,
  deleteMedia,
  batchDeleteMedia,
  formatFileSize,
  Media,
  MediaParams,
} from '@/services/media-service'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/media/')({
  component: MediaPage,
})

function MediaPage() {
  const [mediaList, setMediaList] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true)
      const params: MediaParams = {
        page,
        page_size: pageSize,
        keyword: searchQuery || undefined,
        type: typeFilter !== 'all' ? (typeFilter as 'image' | 'document') : undefined,
      }

      const response = await getMediaList(params)
      setMediaList(response?.list || [])
      setTotal(response?.pagination?.total || 0)
    } catch (error) {
      console.error('获取媒体列表失败:', error)
      setMediaList([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchQuery, typeFilter])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

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

  const handleDelete = (media: Media) => {
    setSelectedMedia(media)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedMedia) return

    try {
      await deleteMedia(selectedMedia.id)
      setDeleteDialogOpen(false)
      setSelectedMedia(null)
      fetchMedia()
      toast.success('删除成功')
    } catch (error) {
      console.error('删除媒体失败:', error)
      toast.error('删除失败')
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return

    try {
      await batchDeleteMedia(selectedIds)
      setSelectedIds([])
      fetchMedia()
      toast.success('批量删除成功')
    } catch (error) {
      console.error('批量删除失败:', error)
      toast.error('批量删除失败')
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const copyUrl = async (media: Media) => {
    try {
      await navigator.clipboard.writeText(media.url)
      setCopiedId(media.id)
      toast.success('链接已复制')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('复制失败:', error)
      toast.error('复制失败')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const isImage = (mimeType: string) => mimeType.startsWith('image/')

  return (
    <Page>
      <PageHeaderBar>
        <PageHeader
          title="媒体管理"
          description="管理上传的图片和文件"
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
                    placeholder="搜索文件名..."
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
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="全部类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="image">图片</SelectItem>
                    <SelectItem value="document">文档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                {selectedIds.length > 0 && (
                  <Button variant="destructive" onClick={handleBatchDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除选中 ({selectedIds.length})
                  </Button>
                )}
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  上传文件
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : mediaList.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaList.map((media) => (
                    <div
                      key={media.id}
                      className={`group relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedIds.includes(media.id)
                          ? 'ring-2 ring-primary'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => toggleSelect(media.id)}
                    >
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        {isImage(media.mime_type) ? (
                          <img
                            src={media.url}
                            alt={media.original_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <File className="w-12 h-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-sm truncate" title={media.original_name}>
                          {media.original_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(media.size)}
                        </p>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyUrl(media)
                          }}
                        >
                          {copiedId === media.id ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(media)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {selectedIds.includes(media.id) && (
                        <div className="absolute top-2 left-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
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
                title="暂无媒体文件"
                description="上传您的第一个文件"
                icon={<ImageIcon className="h-8 w-8 text-muted-foreground" />}
                action={{
                  label: '上传文件',
                  onClick: () => setUploadDialogOpen(true),
                }}
              />
            )}
          </CardContent>
        </Card>
      </PageBody>

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={fetchMedia}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除"
        description={`确定要删除文件 "${selectedMedia?.original_name}" 吗？此操作不可撤销。`}
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </Page>
  )
}
