'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import Footer from '@/components/Footer';
import { articleApi } from '@/lib/api';
import { ArticleList } from '@/types';

function SearchParamsWrapper() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  return <Home searchQuery={searchQuery} />;
}

function Home({ searchQuery }: { searchQuery: string | null }) {
  const [articles, setArticles] = useState<ArticleList[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const pageSize = 10;

  const fetchArticles = useCallback(async (page: number, keyword?: string | null) => {
    setLoading(true);
    try {
      let response;
      if (keyword && keyword.trim()) {
        response = await articleApi.searchArticles({
          q: keyword.trim(),
          page,
          page_size: pageSize,
          status: 'published',
        });
      } else {
        response = await articleApi.getArticles({
          page,
          page_size: pageSize,
          status: 'published',
          sort_by: 'published_at',
          sort_order: 'desc',
        });
      }
      
      if (response.code === 200) {
        setArticles(response.data.list);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.total_pages);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchArticles(currentPage, searchQuery);
  }, [currentPage, searchQuery, fetchArticles]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Navbar />

      <main className="flex-1">
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              技术博客
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              记录学习、分享经验、探索技术
            </p>
          </div>
        </section>

        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {searchQuery && (
              <div className="max-w-4xl mx-auto mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  搜索 '<span className="font-medium text-indigo-600 dark:text-indigo-400">{searchQuery}</span>' 找到 {total} 篇文章
                </p>
              </div>
            )}
            
            <div className="max-w-4xl mx-auto">
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex flex-col sm:flex-row border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="sm:w-48 md:w-56 lg:w-64 flex-shrink-0">
                          <div className="aspect-[4/3] sm:aspect-square bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                        <div className="flex-1 p-4 sm:p-5">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : articles.length > 0 ? (
                <div className="space-y-6">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    {searchQuery ? '未找到相关文章' : '暂无文章'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? '请尝试其他搜索关键词' : '敬请期待更多精彩内容'}
                  </p>
                </div>
              )}

              {!loading && articles.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsWrapper />
    </Suspense>
  );
}
