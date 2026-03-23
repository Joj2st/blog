from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.schemas.article import (
    ArticleCreate, ArticleUpdate, ArticleResponse,
    ArticleListResponse, ArticleDetailResponse, ArticleBatchAction
)
from app.services.article_service import ArticleService
from app.models.article import ArticleStatus
from app.models.user import User
from app.core.dependencies import (
    get_article_service, get_current_user, get_current_author_or_admin, get_optional_user, get_current_admin_user
)
from app.utils.response import ApiResponse

router = APIRouter(prefix="/articles", tags=["文章"])

GUEST_ARTICLE_LIMIT = 10


@router.get("", summary="获取文章列表")
async def get_article_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    article_status: Optional[ArticleStatus] = Query(None, alias="status", description="文章状态"),
    author_id: Optional[int] = Query(None, description="作者ID"),
    category_id: Optional[int] = Query(None, description="分类ID"),
    tag_id: Optional[int] = Query(None, description="标签ID"),
    sort_by: str = Query("created_at", description="排序字段"),
    sort_order: str = Query("desc", description="排序方式 asc/desc"),
    current_user: Optional[User] = Depends(get_optional_user),
    article_service: ArticleService = Depends(get_article_service),
):
    if not current_user:
        page = 1
        page_size = GUEST_ARTICLE_LIMIT
    
    articles, total = await article_service.get_article_list(
        page=page,
        page_size=page_size,
        keyword=keyword,
        status=article_status,
        author_id=author_id,
        category_id=category_id,
        tag_id=tag_id,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return ApiResponse.paginated(
        items=[ArticleListResponse.model_validate(a) for a in articles],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/search", summary="搜索文章")
async def search_articles(
    q: str = Query(..., min_length=1, description="搜索关键词"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    article_status: Optional[ArticleStatus] = Query(None, alias="status", description="文章状态"),
    current_user: Optional[User] = Depends(get_optional_user),
    article_service: ArticleService = Depends(get_article_service),
):
    if not current_user:
        page = 1
        page_size = GUEST_ARTICLE_LIMIT
    
    articles, total = await article_service.search_articles(
        keyword=q,
        page=page,
        page_size=page_size,
        status=article_status,
    )
    return ApiResponse.paginated(
        items=[ArticleListResponse.model_validate(a) for a in articles],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/my", summary="获取我的文章列表")
async def get_my_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    article_status: Optional[ArticleStatus] = Query(None, alias="status", description="文章状态"),
    current_user: User = Depends(get_current_user),
    article_service: ArticleService = Depends(get_article_service),
):
    articles, total = await article_service.get_my_articles(
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        status=article_status,
    )
    return ApiResponse.paginated(
        items=[ArticleListResponse.model_validate(a) for a in articles],
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("", summary="创建文章")
async def create_article(
    article_in: ArticleCreate,
    current_user: User = Depends(get_current_author_or_admin),
    article_service: ArticleService = Depends(get_article_service),
):
    article = await article_service.create_article(
        article_in=article_in,
        author_id=current_user.id,
    )
    return ApiResponse.created(
        data=ArticleResponse.model_validate(article),
        message="文章创建成功"
    )


@router.post("/batch", summary="批量操作文章")
async def batch_operation_articles(
    batch_in: ArticleBatchAction,
    current_user: User = Depends(get_current_admin_user),
    article_service: ArticleService = Depends(get_article_service),
):
    result = await article_service.batch_operation(
        ids=batch_in.ids,
        action=batch_in.action,
        category_id=batch_in.category_id,
    )
    return ApiResponse.success(
        data=result,
        message="批量操作成功"
    )


@router.get("/{article_id}", summary="获取文章详情")
async def get_article_detail(
    article_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    article_service: ArticleService = Depends(get_article_service),
):
    if not current_user:
        is_allowed = await article_service.is_article_in_guest_list(article_id)
        if not is_allowed:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="请登录后查看更多文章",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    article = await article_service.get_article_detail(article_id)
    return ApiResponse.success(data=ArticleDetailResponse.model_validate(article))


@router.put("/{article_id}", summary="更新文章")
async def update_article(
    article_id: int,
    article_in: ArticleUpdate,
    current_user: User = Depends(get_current_author_or_admin),
    article_service: ArticleService = Depends(get_article_service),
):
    article = await article_service.update_article(
        article_id=article_id,
        article_in=article_in,
        current_user=current_user,
    )
    return ApiResponse.success(
        data=ArticleResponse.model_validate(article),
        message="文章更新成功"
    )


@router.delete("/{article_id}", summary="删除文章")
async def delete_article(
    article_id: int,
    current_user: User = Depends(get_current_author_or_admin),
    article_service: ArticleService = Depends(get_article_service),
):
    await article_service.delete_article(
        article_id=article_id,
        current_user=current_user,
    )
    return ApiResponse.success(message="文章删除成功")


@router.post("/{article_id}/publish", summary="发布文章")
async def publish_article(
    article_id: int,
    current_user: User = Depends(get_current_author_or_admin),
    article_service: ArticleService = Depends(get_article_service),
):
    article = await article_service.publish_article(
        article_id=article_id,
        current_user=current_user,
    )
    return ApiResponse.success(
        data=ArticleResponse.model_validate(article),
        message="文章发布成功"
    )


@router.post("/{article_id}/archive", summary="归档文章")
async def archive_article(
    article_id: int,
    current_user: User = Depends(get_current_author_or_admin),
    article_service: ArticleService = Depends(get_article_service),
):
    article = await article_service.archive_article(
        article_id=article_id,
        current_user=current_user,
    )
    return ApiResponse.success(
        data=ArticleResponse.model_validate(article),
        message="文章已归档"
    )


@router.post("/{article_id}/like", summary="点赞文章")
async def like_article(
    article_id: int,
    article_service: ArticleService = Depends(get_article_service),
):
    article = await article_service.increment_like(article_id)
    return ApiResponse.success(
        data={"like_count": article.like_count},
        message="点赞成功"
    )


@router.delete("/{article_id}/like", summary="取消点赞")
async def unlike_article(
    article_id: int,
    article_service: ArticleService = Depends(get_article_service),
):
    article = await article_service.decrement_like(article_id)
    return ApiResponse.success(
        data={"like_count": article.like_count},
        message="取消点赞成功"
    )
