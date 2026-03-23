from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.comment import CommentStatus


class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000, description="评论内容")
    parent_id: Optional[int] = Field(None, description="父评论ID")
    reply_to_id: Optional[int] = Field(None, description="被回复用户ID")


class CommentCreate(CommentBase):
    pass


class CommentUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=2000, description="评论内容")
    status: Optional[CommentStatus] = Field(None, description="评论状态")


class CommentUserInfo(BaseModel):
    id: int
    nickname: str
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


class ReplyToUserInfo(BaseModel):
    id: int
    nickname: str

    class Config:
        from_attributes = True


class ArticleInfo(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True


class CommentResponse(BaseModel):
    id: int
    article_id: int
    user_id: int
    parent_id: Optional[int] = None
    reply_to_id: Optional[int] = None
    content: str
    status: CommentStatus
    like_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: CommentUserInfo
    reply_to: Optional[ReplyToUserInfo] = None

    class Config:
        from_attributes = True


class CommentWithReplies(CommentResponse):
    replies: List["CommentWithReplies"] = []
    reply_count: int = 0


class CommentListResponse(BaseModel):
    id: int
    article_id: int
    user_id: int
    parent_id: Optional[int] = None
    content: str
    status: CommentStatus
    like_count: int = 0
    created_at: datetime
    user: CommentUserInfo
    reply_count: int = 0

    class Config:
        from_attributes = True


class AdminCommentResponse(BaseModel):
    id: int
    article_id: int
    user_id: int
    parent_id: Optional[int] = None
    content: str
    status: CommentStatus
    like_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: CommentUserInfo
    article: ArticleInfo

    class Config:
        from_attributes = True


CommentWithReplies.model_rebuild()
