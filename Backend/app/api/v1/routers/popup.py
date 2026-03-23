from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.schemas.popup import (
    PopupCreate,
    PopupUpdate,
    PopupResponse,
    PopupListResponse,
    PopupActiveResponse,
    BatchDeleteRequest,
    BatchDeleteResponse,
    SortRequest,
)
from app.services.popup_service import PopupService
from app.models.popup import PopupType, PopupStatus
from app.models.user import User
from app.core.dependencies import (
    get_popup_service,
    get_current_admin_user,
)
from app.utils.response import ApiResponse

router = APIRouter(prefix="/popups", tags=["弹窗通知"])


@router.get("/active", summary="获取活跃弹窗")
async def get_active_popups(
    type: Optional[PopupType] = Query(None, description="弹窗类型"),
    popup_service: PopupService = Depends(get_popup_service),
):
    popups = await popup_service.get_active_popups(type=type)
    return ApiResponse.success(
        data=[PopupActiveResponse.model_validate(p) for p in popups]
    )


@router.get("", summary="获取弹窗列表")
async def get_popup_list(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    type: Optional[PopupType] = Query(None, description="弹窗类型"),
    status: Optional[PopupStatus] = Query(None, description="弹窗状态"),
    keyword: Optional[str] = Query(None, description="关键词搜索"),
    current_user: User = Depends(get_current_admin_user),
    popup_service: PopupService = Depends(get_popup_service),
):
    popup_list, total = await popup_service.get_popup_list(
        page=page,
        page_size=page_size,
        type=type,
        status=status,
        keyword=keyword,
    )

    return ApiResponse.paginated(
        items=[PopupListResponse.model_validate(p) for p in popup_list],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{popup_id}", summary="获取弹窗详情")
async def get_popup_detail(
    popup_id: int,
    current_user: User = Depends(get_current_admin_user),
    popup_service: PopupService = Depends(get_popup_service),
):
    popup = await popup_service.get_popup_by_id(popup_id)
    return ApiResponse.success(data=PopupResponse.model_validate(popup))


@router.post("", summary="创建弹窗")
async def create_popup(
    popup_create: PopupCreate,
    current_user: User = Depends(get_current_admin_user),
    popup_service: PopupService = Depends(get_popup_service),
):
    popup = await popup_service.create_popup(popup_create)
    return ApiResponse.created(
        data=PopupResponse.model_validate(popup),
        message="创建成功"
    )


@router.put("/{popup_id}", summary="更新弹窗")
async def update_popup(
    popup_id: int,
    popup_update: PopupUpdate,
    current_user: User = Depends(get_current_admin_user),
    popup_service: PopupService = Depends(get_popup_service),
):
    popup = await popup_service.update_popup(popup_id, popup_update)
    return ApiResponse.success(
        data=PopupResponse.model_validate(popup),
        message="更新成功"
    )


@router.delete("/{popup_id}", summary="删除弹窗")
async def delete_popup(
    popup_id: int,
    current_user: User = Depends(get_current_admin_user),
    popup_service: PopupService = Depends(get_popup_service),
):
    await popup_service.delete_popup(popup_id)
    return ApiResponse.success(message="删除成功")


@router.post("/batch-delete", summary="批量删除弹窗")
async def batch_delete_popups(
    request: BatchDeleteRequest,
    current_user: User = Depends(get_current_admin_user),
    popup_service: PopupService = Depends(get_popup_service),
):
    result = await popup_service.batch_delete_popups(request.ids)
    return ApiResponse.success(
        data=BatchDeleteResponse(**result),
        message="批量删除成功"
    )


@router.post("/{popup_id}/show", summary="记录弹窗展示")
async def record_popup_show(
    popup_id: int,
    popup_service: PopupService = Depends(get_popup_service),
):
    await popup_service.record_show(popup_id)
    return ApiResponse.success()


@router.post("/{popup_id}/click", summary="记录弹窗点击")
async def record_popup_click(
    popup_id: int,
    popup_service: PopupService = Depends(get_popup_service),
):
    await popup_service.record_click(popup_id)
    return ApiResponse.success()


@router.put("/sort", summary="更新弹窗排序")
async def update_popup_sort(
    request: SortRequest,
    current_user: User = Depends(get_current_admin_user),
    popup_service: PopupService = Depends(get_popup_service),
):
    items = [{"id": item.id, "sort_order": item.sort_order} for item in request.items]
    await popup_service.update_sort_order(items)
    return ApiResponse.success(message="排序更新成功")
