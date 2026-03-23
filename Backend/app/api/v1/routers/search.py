from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from app.schemas.article import ArticleListResponse
from app.services.article_service import ArticleService
from app.models.article import ArticleStatus
from app.models.user import User
from app.core.dependencies import get_article_service, get_optional_user
from app.utils.response import ApiResponse

router = APIRouter(prefix="/search", tags=["搜索"])


@router.get("", summary="高级搜索文章")
async def search_articles(
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    category_id: Optional[int] = Query(None, description="分类ID"),
    tags: Optional[str] = Query(None, description="标签ID列表，逗号分隔，如: 1,2,3"),
    start_date: Optional[str] = Query(None, description="开始日期，格式: YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="结束日期，格式: YYYY-MM-DD"),
    sort_by: str = Query("published_at", description="排序字段: published_at, view_count, like_count, created_at"),
    sort_order: str = Query("desc", description="排序方式: asc/desc"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    current_user: Optional[User] = Depends(get_optional_user),
    article_service: ArticleService = Depends(get_article_service),
):
    tag_ids = None
    if tags:
        try:
            tag_ids = [int(t.strip()) for t in tags.split(",") if t.strip()]
        except ValueError:
            tag_ids = None
    
    start_datetime = None
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
        except ValueError:
            pass
    
    end_datetime = None
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
        except ValueError:
            pass
    
    status = ArticleStatus.published if not current_user else None
    
    articles, total = await article_service.advanced_search(
        keyword=keyword,
        status=status,
        category_id=category_id,
        tag_ids=tag_ids,
        start_date=start_datetime,
        end_date=end_datetime,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )
    
    return ApiResponse.paginated(
        items=[ArticleListResponse.model_validate(a) for a in articles],
        total=total,
        page=page,
        page_size=page_size
    )
