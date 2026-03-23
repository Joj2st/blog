export interface User {
  id: number;
  email: string;
  nickname: string;
  avatar?: string;
  bio?: string;
  role: 'admin' | 'author' | 'user';
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  updated_at?: string;
}

export interface Author {
  id: number;
  nickname: string;
  avatar?: string;
}

export interface CommentUserInfo {
  id: number;
  nickname: string;
  avatar?: string;
}

export interface ReplyToUserInfo {
  id: number;
  nickname: string;
}

export interface Comment {
  id: number;
  article_id: number;
  user_id: number;
  parent_id?: number | null;
  reply_to_id?: number | null;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'trash';
  like_count: number;
  created_at: string;
  updated_at?: string;
  user: CommentUserInfo;
  reply_to?: ReplyToUserInfo | null;
  replies: Comment[];
  reply_count: number;
}

export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
}

export interface TagInfo {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export interface Article {
  id: number;
  title: string;
  summary?: string;
  content: string;
  cover_image?: string;
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  like_count: number;
  comment_count: number;
  author_id: number;
  author?: Author;
  category?: CategoryInfo;
  tags: TagInfo[];
  published_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface ArticleList {
  id: number;
  title: string;
  summary?: string;
  cover_image?: string;
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  like_count: number;
  comment_count: number;
  author_id: number;
  author?: Author;
  category?: CategoryInfo;
  tags: TagInfo[];
  published_at?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  sort_order: number;
  article_count: number;
  created_at: string;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  article_count: number;
  created_at: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginationInfo {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginatedData<T> {
  list: T[];
  pagination: PaginationInfo;
}
