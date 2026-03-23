from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from app.schemas.comment import (
    CommentCreate, CommentUpdate, CommentResponse, CommentWithReplies, AdminCommentResponse
)
from app.services.comment_service import CommentService
from app.models.comment import CommentStatus
from app.models.user import User
from app.core.dependencies import (
    get_comment_service, get_current_user, get_current_admin_user
)
from app.utils.response import ApiResponse

router = APIRouter(prefix="/comments", tags=["评论"])


@router.get("", summary="获取所有评论列表(管理员)")
async def get_all_comments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[CommentStatus] = Query(None),
    keyword: Optional[str] = Query(None),
    article_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_admin_user),
    comment_service: CommentService = Depends(get_comment_service),
):
    comments, total = await comment_service.get_all_comments(
        page=page,
        page_size=page_size,
        status=status,
        keyword=keyword,
        article_id=article_id,
    )
    return ApiResponse.paginated(
        items=[AdminCommentResponse.model_validate(c) for c in comments],
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("/articles/{article_id}", summary="创建文章评论")
async def create_article_comment(
    article_id: int,
    comment_in: CommentCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    comment_service: CommentService = Depends(get_comment_service),
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")[:500]
    
    comment = await comment_service.create_comment(
        comment_in=comment_in,
        article_id=article_id,
        user_id=current_user.id,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    return ApiResponse.created(
        data=CommentResponse.model_validate(comment),
        message="评论发布成功"
    )


@router.get("/articles/{article_id}", summary="获取文章评论列表")
async def get_article_comments(
    article_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    comment_service: CommentService = Depends(get_comment_service),
):
    comments, total = await comment_service.get_comments_by_article(
        article_id=article_id,
        page=page,
        page_size=page_size,
    )
    return ApiResponse.paginated(
        items=comments,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/my", summary="获取我的评论列表")
async def get_my_comments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    comment_service: CommentService = Depends(get_comment_service),
):
    comments, total = await comment_service.get_comments_by_user(
        user_id=current_user.id,
        page=page,
        page_size=page_size,
    )
    return ApiResponse.paginated(
        items=[CommentResponse.model_validate(c) for c in comments],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{comment_id}", summary="获取评论详情")
async def get_comment_detail(
    comment_id: int,
    comment_service: CommentService = Depends(get_comment_service),
):
    comment = await comment_service.get_comment_by_id(comment_id)
    return ApiResponse.success(data=CommentResponse.model_validate(comment))


@router.put("/{comment_id}", summary="更新评论")
async def update_comment(
    comment_id: int,
    comment_in: CommentUpdate,
    current_user: User = Depends(get_current_user),
    comment_service: CommentService = Depends(get_comment_service),
):
    comment = await comment_service.update_comment(
        comment_id=comment_id,
        comment_in=comment_in,
        current_user=current_user,
    )
    return ApiResponse.success(
        data=CommentResponse.model_validate(comment),
        message="评论更新成功"
    )


@router.delete("/{comment_id}", summary="删除评论")
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    comment_service: CommentService = Depends(get_comment_service),
):
    await comment_service.delete_comment(
        comment_id=comment_id,
        current_user=current_user,
    )
    return ApiResponse.success(message="评论删除成功")


@router.put("/{comment_id}/status", summary="更新评论状态")
async def update_comment_status(
    comment_id: int,
    status: CommentStatus,
    current_user: User = Depends(get_current_admin_user),
    comment_service: CommentService = Depends(get_comment_service),
):
    comment = await comment_service.update_comment_status(
        comment_id=comment_id,
        status=status,
        current_user=current_user,
    )
    return ApiResponse.success(
        data=CommentResponse.model_validate(comment),
        message="评论状态更新成功"
    )


@router.post("/{comment_id}/like", summary="点赞评论")
async def like_comment(
    comment_id: int,
    comment_service: CommentService = Depends(get_comment_service),
):
    comment = await comment_service.like_comment(comment_id)
    return ApiResponse.success(
        data={"like_count": comment.like_count},
        message="点赞成功"
    )


@router.delete("/{comment_id}/like", summary="取消点赞")
async def unlike_comment(
    comment_id: int,
    comment_service: CommentService = Depends(get_comment_service),
):
    comment = await comment_service.unlike_comment(comment_id)
    return ApiResponse.success(
        data={"like_count": comment.like_count},
        message="取消点赞成功"
    )
