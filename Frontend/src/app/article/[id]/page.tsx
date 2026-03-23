'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { articleApi, commentApi } from '@/lib/api';
import { Article, Comment as CommentType } from '@/types';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = parseInt(params?.id as string, 10);
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const [replyTarget, setReplyTarget] = useState<{ commentId: number; nickname: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchArticle = useCallback(async () => {
    if (isNaN(articleId)) {
      setError('无效的文章ID');
      setLoading(false);
      return;
    }

    try {
      const response = await articleApi.getArticleById(articleId);
      if (response.code === 200) {
        setArticle(response.data);
        setLikeCount(response.data.like_count);
      } else {
        setError('文章不存在');
      }
    } catch (err) {
      console.error('Failed to fetch article:', err);
      setError('加载文章失败');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  const fetchComments = useCallback(async () => {
    if (isNaN(articleId)) return;

    setCommentsLoading(true);
    try {
      const response = await commentApi.getCommentsByArticle(articleId, { page: 1, page_size: 50 });
      if (response.code === 200) {
        setComments(response.data.list);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchArticle();
    fetchComments();
  }, [fetchArticle, fetchComments]);

  const handleLike = async () => {
    if (!article) return;
    
    try {
      if (liked) {
        const response = await articleApi.unlikeArticle(article.id);
        if (response.code === 200) {
          setLiked(false);
          setLikeCount(response.data.like_count);
        }
      } else {
        const response = await articleApi.likeArticle(article.id);
        if (response.code === 200) {
          setLiked(true);
          setLikeCount(response.data.like_count);
        }
      }
    } catch (err) {
      console.error('Failed to like/unlike article:', err);
    }
  };

  const handleSubmitComment = async () => {
    if (!article || !commentContent.trim()) return;
    
    setSubmittingComment(true);
    try {
      const response = await commentApi.createComment(article.id, { content: commentContent });
      if (response.code === 200) {
        setCommentContent('');
        fetchComments();
        if (article) {
          setArticle({ ...article, comment_count: article.comment_count + 1 });
        }
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = async (parentId: number) => {
    if (!article || !replyContent.trim()) return;
    
    setSubmittingReply(true);
    try {
      const targetComment = comments.find(c => c.id === parentId);
      const response = await commentApi.createComment(article.id, { 
        content: replyContent, 
        parent_id: parentId,
        reply_to_id: targetComment?.user_id
      });
      if (response.code === 200) {
        setReplyContent('');
        setReplyTarget(null);
        fetchComments();
        if (article) {
          setArticle({ ...article, comment_count: article.comment_count + 1 });
        }
      }
    } catch (err) {
      console.error('Failed to submit reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCommentLike = async (commentId: number, isLiked: boolean) => {
    try {
      const response = isLiked 
        ? await commentApi.unlikeComment(commentId)
        : await commentApi.likeComment(commentId);
      
      if (response.code === 200) {
        setComments(comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, like_count: response.data.like_count };
          }
          const updateReplies = (replies: CommentType[]): CommentType[] => {
            return replies.map(reply => {
              if (reply.id === commentId) {
                return { ...reply, like_count: response.data.like_count };
              }
              if (reply.replies && reply.replies.length > 0) {
                return { ...reply, replies: updateReplies(reply.replies) };
              }
              return reply;
            });
          };
          return { ...comment, replies: updateReplies(comment.replies) };
        }));
      }
    } catch (err) {
      console.error('Failed to like/unlike comment:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const defaultCover = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800';

  const renderComment = (comment: CommentType, level: number = 0) => (
    <div key={comment.id} className={`border-t border-gray-200 dark:border-gray-700 pt-6 ${level > 0 ? 'ml-8 mt-6' : ''}`}>
      <div className="flex gap-4">
        <img 
          src={comment.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
          alt={comment.user.nickname}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900 dark:text-white">{comment.user.nickname}</span>
            {comment.reply_to && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                回复 <span className="text-indigo-600 dark:text-indigo-400">{comment.reply_to.nickname}</span>
              </span>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(comment.created_at)}</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-3">{comment.content}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleCommentLike(comment.id, false)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span>{comment.like_count}</span>
            </button>
            <button
              onClick={() => setReplyTarget({ commentId: comment.id, nickname: comment.user.nickname })}
              className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
            >
              回复
            </button>
          </div>
          
          {replyTarget?.commentId === comment.id && (
            <div className="mt-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  回复 <span className="font-medium">{replyTarget.nickname}</span>：
                </p>
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="写下你的回复..."
                  className="mb-3"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleReply(comment.id)}
                    disabled={submittingReply || !replyContent.trim()}
                  >
                    {submittingReply ? '发送中...' : '发送回复'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setReplyTarget(null);
                      setReplyContent('');
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map(reply => renderComment(reply, level + 1))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-64 sm:h-80 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {error || '文章不存在'}
            </h1>
            <Button onClick={() => router.push('/')}>返回首页</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Navbar />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link href="/" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回首页
              </Link>
            </div>

            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              {article.cover_image && (
                <div className="mb-6">
                  <img
                    src={article.cover_image || defaultCover}
                    alt={article.title}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                </div>
              )}

              <div className="px-6 sm:px-8 pb-8">
                {article.category && (
                  <div className="mb-4">
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                      {article.category.name}
                    </span>
                  </div>
                )}

                <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                  {article.author && (
                    <div className="flex items-center gap-2">
                      {article.author.avatar && (
                        <img 
                          src={article.author.avatar} 
                          alt={article.author.nickname}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {article.author.nickname}
                      </span>
                    </div>
                  )}
                  <span>•</span>
                  <span>{formatDate(article.published_at || article.created_at)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {article.view_count} 阅读
                  </span>
                </div>

                {article.summary && (
                  <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border-l-4 border-indigo-500">
                    <p className="text-gray-700 dark:text-gray-300 italic">
                      {article.summary}
                    </p>
                  </div>
                )}

                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white border-b pb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">{children}</h3>,
                      p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>,
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-600 dark:text-indigo-400">
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto my-6">
                            <code className="text-sm font-mono">{children}</code>
                          </pre>
                        );
                      },
                      ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ol>,
                      li: ({ children }) => <li className="ml-4">{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-indigo-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 py-2">
                          {children}
                        </blockquote>
                      ),
                      a: ({ children, href }) => (
                        <a href={href} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                      strong: ({ children }) => <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>,
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>,
                      tbody: ({ children }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>,
                      tr: ({ children }) => <tr>{children}</tr>,
                      th: ({ children }) => <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">{children}</th>,
                      td: ({ children }) => <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{children}</td>,
                    }}
                  >
                    {article.content}
                  </ReactMarkdown>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {article.tags && article.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">相关标签</h3>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <span 
                            key={tag.id} 
                            className="px-3 py-1 text-sm font-medium rounded-full transition-transform hover:scale-105"
                            style={{ 
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                            }}
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          liked
                            ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill={liked ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span>{likeCount}</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{article.comment_count} 评论</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">发表评论</h2>
              <div className="mb-6">
                <Textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="写下你的评论..."
                  className="mb-3"
                  rows={4}
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={submittingComment || !commentContent.trim()}
                >
                  {submittingComment ? '发布中...' : '发布评论'}
                </Button>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  评论 ({comments.length})
                </h3>
                {commentsLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>还没有评论，快来抢沙发吧！</p>
                  </div>
                ) : (
                  <div>
                    {comments.map(comment => renderComment(comment))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
