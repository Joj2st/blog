from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form
from app.schemas.media import (
    MediaResponse, MediaListResponse, BatchDeleteRequest, BatchDeleteResponse
)
from app.services.media_service import MediaService
from app.models.media import MediaType
from app.models.user import User
from app.core.dependencies import (
    get_media_service, get_current_user, get_current_author_or_admin, get_current_admin_user
)
from app.utils.response import ApiResponse

router = APIRouter(prefix="/media", tags=["媒体"])


@router.post("/upload", summary="上传文件")
async def upload_file(
    file: UploadFile = File(..., description="文件"),
    type: MediaType = Form(default=MediaType.image, description="文件类型"),
    current_user: User = Depends(get_current_author_or_admin),
    media_service: MediaService = Depends(get_media_service),
):
    media = await media_service.upload_file(
        file=file,
        uploader_id=current_user.id,
        type=type,
    )
    return ApiResponse.created(
        data=MediaResponse.model_validate(media),
        message="上传成功"
    )


@router.get("", summary="获取文件列表")
async def get_media_list(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    type: Optional[MediaType] = Query(None, description="文件类型"),
    keyword: Optional[str] = Query(None, description="文件名搜索"),
    start_date: Optional[str] = Query(None, description="开始日期"),
    end_date: Optional[str] = Query(None, description="结束日期"),
    current_user: User = Depends(get_current_author_or_admin),
    media_service: MediaService = Depends(get_media_service),
):
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

    media_list, total = await media_service.get_media_list(
        page=page,
        page_size=page_size,
        type=type,
        keyword=keyword,
        start_date=start_datetime,
        end_date=end_datetime,
    )

    return ApiResponse.paginated(
        items=[MediaListResponse.model_validate(m) for m in media_list],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{media_id}", summary="获取文件详情")
async def get_media_detail(
    media_id: int,
    current_user: User = Depends(get_current_author_or_admin),
    media_service: MediaService = Depends(get_media_service),
):
    media = await media_service.get_media_by_id(media_id)
    return ApiResponse.success(data=MediaResponse.model_validate(media))


@router.delete("/{media_id}", summary="删除文件")
async def delete_media(
    media_id: int,
    current_user: User = Depends(get_current_user),
    media_service: MediaService = Depends(get_media_service),
):
    await media_service.delete_media(media_id, current_user)
    return ApiResponse.success(message="删除成功")


@router.post("/batch-delete", summary="批量删除文件")
async def batch_delete_media(
    request: BatchDeleteRequest,
    current_user: User = Depends(get_current_admin_user),
    media_service: MediaService = Depends(get_media_service),
):
    result = await media_service.batch_delete_media(request.ids, current_user)
    return ApiResponse.success(
        data=BatchDeleteResponse(**result),
        message="批量删除成功"
    )
