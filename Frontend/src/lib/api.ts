const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number>;
  skipAuth?: boolean;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { params, skipAuth, ...restConfig } = config;
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...restConfig.headers as Record<string, string>,
  };

  if (token && !skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...restConfig,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'GET' }),
  
  post: <T>(endpoint: string, data: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: <T>(endpoint: string, data: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  patch: <T>(endpoint: string, data: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'DELETE' }),
};

import { ApiResponse, PaginatedData, Article, ArticleList, Category, CategoryTree, Tag, Comment } from '@/types';

export interface ArticleListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  status?: string;
  author_id?: number;
  category_id?: number;
  tag_id?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface ArticleSearchParams {
  q: string;
  page?: number;
  page_size?: number;
  status?: string;
}

export const articleApi = {
  getArticles: async (params: ArticleListParams): Promise<ApiResponse<PaginatedData<ArticleList>>> => {
    return api.get<ApiResponse<PaginatedData<ArticleList>>>('/articles', { params: params as Record<string, string | number> });
  },

  searchArticles: async (params: ArticleSearchParams): Promise<ApiResponse<PaginatedData<ArticleList>>> => {
    return api.get<ApiResponse<PaginatedData<ArticleList>>>('/articles/search', { params: params as Record<string, string | number> });
  },

  getArticleById: async (id: number): Promise<ApiResponse<Article>> => {
    return api.get<ApiResponse<Article>>(`/articles/${id}`);
  },

  getMyArticles: async (params: ArticleListParams): Promise<ApiResponse<PaginatedData<ArticleList>>> => {
    return api.get<ApiResponse<PaginatedData<ArticleList>>>('/articles/my', { params: params as Record<string, string | number> });
  },

  createArticle: async (data: { title: string; summary?: string; content: string; cover_image?: string; status?: string }): Promise<ApiResponse<Article>> => {
    return api.post<ApiResponse<Article>>('/articles', data);
  },

  updateArticle: async (id: number, data: { title?: string; summary?: string; content?: string; cover_image?: string; status?: string }): Promise<ApiResponse<Article>> => {
    return api.put<ApiResponse<Article>>(`/articles/${id}`, data);
  },

  deleteArticle: async (id: number): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(`/articles/${id}`);
  },

  publishArticle: async (id: number): Promise<ApiResponse<Article>> => {
    return api.post<ApiResponse<Article>>(`/articles/${id}/publish`, {});
  },

  archiveArticle: async (id: number): Promise<ApiResponse<Article>> => {
    return api.post<ApiResponse<Article>>(`/articles/${id}/archive`, {});
  },

  likeArticle: async (id: number): Promise<ApiResponse<{ like_count: number }>> => {
    return api.post<ApiResponse<{ like_count: number }>>(`/articles/${id}/like`, {});
  },

  unlikeArticle: async (id: number): Promise<ApiResponse<{ like_count: number }>> => {
    return api.delete<ApiResponse<{ like_count: number }>>(`/articles/${id}/like`);
  },
};

export interface CategoryListParams {
  parent_id?: number;
  skip?: number;
  limit?: number;
}

export const categoryApi = {
  getCategories: async (params?: CategoryListParams): Promise<ApiResponse<Category[]>> => {
    return api.get<ApiResponse<Category[]>>('/categories', { params: params as Record<string, string | number> });
  },

  getCategoryTree: async (): Promise<ApiResponse<CategoryTree[]>> => {
    return api.get<ApiResponse<CategoryTree[]>>('/categories/tree');
  },

  getCategoryById: async (id: number): Promise<ApiResponse<Category>> => {
    return api.get<ApiResponse<Category>>(`/categories/${id}`);
  },

  getCategoryBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    return api.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
  },
};

export interface TagListParams {
  skip?: number;
  limit?: number;
  order_by?: string;
  order?: string;
}

export const tagApi = {
  getTags: async (params?: TagListParams): Promise<ApiResponse<Tag[]>> => {
    return api.get<ApiResponse<Tag[]>>('/tags', { params: params as Record<string, string | number> });
  },

  getPopularTags: async (limit: number = 10): Promise<ApiResponse<Tag[]>> => {
    return api.get<ApiResponse<Tag[]>>('/tags/popular', { params: { limit } });
  },

  getTagById: async (id: number): Promise<ApiResponse<Tag>> => {
    return api.get<ApiResponse<Tag>>(`/tags/${id}`);
  },

  getTagBySlug: async (slug: string): Promise<ApiResponse<Tag>> => {
    return api.get<ApiResponse<Tag>>(`/tags/slug/${slug}`);
  },
};

export interface CommentListParams {
  page?: number;
  page_size?: number;
}

export interface CreateCommentParams {
  content: string;
  parent_id?: number | null;
  reply_to_id?: number | null;
}

export const commentApi = {
  getCommentsByArticle: async (
    articleId: number,
    params?: CommentListParams
  ): Promise<ApiResponse<PaginatedData<Comment>>> => {
    return api.get<ApiResponse<PaginatedData<Comment>>>(`/comments/articles/${articleId}`, { 
      params: params as Record<string, string | number> 
    });
  },

  createComment: async (
    articleId: number,
    data: CreateCommentParams
  ): Promise<ApiResponse<Comment>> => {
    return api.post<ApiResponse<Comment>>(`/comments/articles/${articleId}`, data);
  },

  getMyComments: async (params?: CommentListParams): Promise<ApiResponse<PaginatedData<Comment>>> => {
    return api.get<ApiResponse<PaginatedData<Comment>>>('/comments/my', { 
      params: params as Record<string, string | number> 
    });
  },

  getCommentById: async (commentId: number): Promise<ApiResponse<Comment>> => {
    return api.get<ApiResponse<Comment>>(`/comments/${commentId}`);
  },

  updateComment: async (
    commentId: number,
    data: { content?: string }
  ): Promise<ApiResponse<Comment>> => {
    return api.put<ApiResponse<Comment>>(`/comments/${commentId}`, data);
  },

  deleteComment: async (commentId: number): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(`/comments/${commentId}`);
  },

  likeComment: async (commentId: number): Promise<ApiResponse<{ like_count: number }>> => {
    return api.post<ApiResponse<{ like_count: number }>>(`/comments/${commentId}/like`, {});
  },

  unlikeComment: async (commentId: number): Promise<ApiResponse<{ like_count: number }>> => {
    return api.delete<ApiResponse<{ like_count: number }>>(`/comments/${commentId}/like`);
  },
};

export interface Popup {
  id: number;
  title: string;
  content: string;
  type: 'notification' | 'advertisement';
  status: 'active' | 'inactive' | 'expired';
  image_url: string | null;
  link_url: string | null;
  start_time: string | null;
  end_time: string | null;
  show_frequency: 'once' | 'daily' | 'always';
  max_show_count: number | null;
  current_show_count: number;
  max_click_count: number | null;
  current_click_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const popupApi = {
  getActivePopups: async (type?: 'notification' | 'advertisement'): Promise<ApiResponse<Popup[]>> => {
    const params = type ? { type } : undefined;
    return api.get<ApiResponse<Popup[]>>('/popups/active', { params: params as Record<string, string | number> });
  },

  recordShow: async (id: number): Promise<ApiResponse<null>> => {
    return api.post<ApiResponse<null>>(`/popups/${id}/show`, {});
  },

  recordClick: async (id: number): Promise<ApiResponse<null>> => {
    return api.post<ApiResponse<null>>(`/popups/${id}/click`, {});
  },
};
