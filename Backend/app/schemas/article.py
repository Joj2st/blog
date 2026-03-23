from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.article import ArticleStatus


class ArticleBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    slug: Optional[str] = Field(None, max_length=200)
    summary: Optional[str] = Field(None, max_length=500)
    content: str = Field(..., min_length=1)
    cover_image: Optional[str] = Field(None, max_length=500)
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    status: ArticleStatus = Field(default=ArticleStatus.draft)
    is_top: bool = Field(default=False)
    is_featured: bool = Field(default=False)


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    summary: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = Field(None, min_length=1)
    cover_image: Optional[str] = Field(None, max_length=500)
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    status: Optional[ArticleStatus] = None


class AuthorInfo(BaseModel):
    id: int
    nickname: str
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


class CategoryInfo(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class TagInfo(BaseModel):
    id: int
    name: str
    slug: str
    color: str = "#3B82F6"

    class Config:
        from_attributes = True


class ArticleResponse(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    content: str
    cover_image: Optional[str] = None
    status: ArticleStatus
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    author_id: int
    author: Optional[AuthorInfo] = None
    category: Optional[CategoryInfo] = None
    tags: List[TagInfo] = []
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ArticleListResponse(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    cover_image: Optional[str] = None
    status: ArticleStatus
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    author_id: int
    author: Optional[AuthorInfo] = None
    category: Optional[CategoryInfo] = None
    tags: List[TagInfo] = []
    published_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ArticleDetailResponse(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    content: str
    cover_image: Optional[str] = None
    status: ArticleStatus
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    author_id: int
    author: Optional[AuthorInfo] = None
    category: Optional[CategoryInfo] = None
    tags: List[TagInfo] = []
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ArticleBatchAction(BaseModel):
    ids: List[int] = Field(..., min_length=1)
    action: str = Field(..., pattern="^(publish|draft|archive|delete|move)$")
    category_id: Optional[int] = None
