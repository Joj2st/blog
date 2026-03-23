import Link from 'next/link';
import { ArticleList } from '@/types';

export interface ArticleCardProps {
  article: ArticleList;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const defaultCover = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800';

  return (
    <Link href={`/article/${article.id}`} className="block group">
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg bg-white dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-48 md:w-56 lg:w-64 flex-shrink-0">
            <div className="aspect-[4/3] sm:aspect-square sm:h-full overflow-hidden">
              <img
                src={article.cover_image || defaultCover}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
          
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {article.category && (
                <div className="mb-2">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    {article.category.name}
                  </span>
                </div>
              )}
              
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                {article.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {article.summary || '暂无摘要'}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-4">
                {article.author && (
                  <div className="flex items-center gap-1">
                    {article.author.avatar && (
                      <img 
                        src={article.author.avatar} 
                        alt={article.author.nickname}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <span>{article.author.nickname}</span>
                  </div>
                )}
                <span>{formatDate(article.published_at || article.created_at)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {article.view_count}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {article.like_count}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
