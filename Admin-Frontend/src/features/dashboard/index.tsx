import { useEffect, useState } from 'react'
import { Page, PageHeader, PageHeaderBar, PageBody } from '@/components/page-header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FileText, Users, Eye, MessageSquare, TrendingUp, Calendar, Award } from 'lucide-react'
import { getDashboardStats, getHotArticles, getTrafficStats, DashboardStats, HotArticle, TrafficStats } from '@/services/stats-service'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatNumber } from '@/lib/format'

export function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [hotArticles, setHotArticles] = useState<HotArticle[]>([])
  const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // 获取仪表盘统计数据
      const stats = await getDashboardStats()
      setDashboardStats(stats)

      // 获取热门文章
      const hotArticlesData = await getHotArticles()
      setHotArticles(hotArticlesData.list)

      // 获取最近7天的访问趋势
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const traffic = await getTrafficStats({
        start_date: startDate,
        end_date: endDate,
        type: 'day'
      })
      setTrafficStats(traffic)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page>
      <PageHeaderBar>
        <PageHeader
          title="仪表盘"
          description="博客系统数据概览"
        />
      </PageHeaderBar>
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 文章统计 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                文章总数
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{dashboardStats?.articles.total || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                已发布 {loading ? <Skeleton className="h-4 w-16" /> : dashboardStats?.articles.published || 0} 篇
              </p>
            </CardContent>
          </Card>

          {/* 用户统计 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                注册用户
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{dashboardStats?.users.total || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                本月新增 {loading ? <Skeleton className="h-4 w-16" /> : dashboardStats?.users.this_month || 0} 人
              </p>
            </CardContent>
          </Card>

          {/* 访问量统计 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                总访问量
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{formatNumber(dashboardStats?.views.this_month || 0)}</div>
              )}
              <p className="text-xs text-muted-foreground">
                今日 {loading ? <Skeleton className="h-4 w-16" /> : formatNumber(dashboardStats?.views.today || 0)} 次
              </p>
            </CardContent>
          </Card>

          {/* 评论统计 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                评论总数
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{dashboardStats?.comments.total || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                待审核 {loading ? <Skeleton className="h-4 w-16" /> : dashboardStats?.comments.pending || 0} 条
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mt-4">
          {/* 访问趋势 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>访问趋势</CardTitle>
                <CardDescription>最近7天的访问数据</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : trafficStats ? (
                <div className="space-y-4">
                  {trafficStats.list.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="text-sm w-20">{item.date}</span>
                      <div className="flex-1">
                        <div className="h-6 flex items-end gap-1">
                          <div
                            className="bg-blue-500 rounded-t"
                            style={{ height: `${Math.min(100, (item.pv / Math.max(...trafficStats.list.map(t => t.pv))) * 100)}%`, flex: 1 }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{formatNumber(item.pv)}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>总访问量: {formatNumber(trafficStats.summary.total_pv)}</span>
                      <span>平均: {formatNumber(Math.round(trafficStats.summary.avg_pv))}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  暂无访问数据
                </div>
              )}
            </CardContent>
          </Card>

          {/* 热门文章 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>热门文章</CardTitle>
                <CardDescription>浏览量最高的文章</CardDescription>
              </div>
              <Award className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : hotArticles.length > 0 ? (
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {hotArticles.map((article, index) => (
                      <div key={article.id} className="space-y-1">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                          <span className="text-sm font-medium truncate">{article.title}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground ml-6">
                          <span>浏览: {formatNumber(article.view_count)}</span>
                          <span>点赞: {article.like_count}</span>
                          <span>评论: {article.comment_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  暂无文章数据
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </Page>
  )
}
