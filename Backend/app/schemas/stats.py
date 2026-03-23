from datetime import date
from typing import Optional, List
from pydantic import BaseModel, Field


class ArticleStats(BaseModel):
    total: int = 0
    published: int = 0
    draft: int = 0
    archived: int = 0
    this_month: int = 0


class UserStats(BaseModel):
    total: int = 0
    active: int = 0
    this_month: int = 0


class CommentStats(BaseModel):
    total: int = 0
    pending: int = 0
    this_month: int = 0


class ViewStats(BaseModel):
    today: int = 0
    this_week: int = 0
    this_month: int = 0


class DashboardStats(BaseModel):
    articles: ArticleStats
    users: UserStats
    comments: CommentStats
    views: ViewStats


class TrafficItem(BaseModel):
    date: str
    pv: int = 0
    uv: int = 0
    ip: int = 0


class TrafficSummary(BaseModel):
    total_pv: int = 0
    total_uv: int = 0
    avg_pv: int = 0
    avg_uv: int = 0


class TrafficResponse(BaseModel):
    list: List[TrafficItem] = []
    summary: TrafficSummary


class HotArticleItem(BaseModel):
    id: int
    title: str
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0

    class Config:
        from_attributes = True


class HotArticlesResponse(BaseModel):
    list: List[HotArticleItem] = []
