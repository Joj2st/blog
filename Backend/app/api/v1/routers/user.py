from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.schemas.user import (
    UserResponse, UserUpdate, UserUpdatePassword, UserUpdateByAdmin,
    UserListResponse, UserDetailResponse, BatchDeleteRequest
)
from app.services.user_service import UserService
from app.core.dependencies import (
    get_user_service, get_current_user, get_current_admin_user
)
from app.utils.response import ApiResponse
from app.models.user import User, UserRole, UserStatus

router = APIRouter(prefix="/users", tags=["用户"])


@router.get("/me", summary="获取当前用户信息")
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    return ApiResponse.success(data=UserResponse.model_validate(current_user))


@router.put("/me", summary="更新当前用户信息")
async def update_current_user_info(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    user = await user_service.update_profile(current_user.id, user_in)
    return ApiResponse.success(
        data=UserResponse.model_validate(user),
        message="更新成功"
    )


@router.put("/me/password", summary="修改密码")
async def change_password(
    password_in: UserUpdatePassword,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    await user_service.change_password(
        current_user.id,
        password_in.old_password,
        password_in.new_password
    )
    return ApiResponse.success(message="密码修改成功")


@router.get("", summary="获取用户列表(管理端)")
async def get_user_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    keyword: Optional[str] = Query(None),
    role: Optional[UserRole] = Query(None),
    status: Optional[UserStatus] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    admin_user: User = Depends(get_current_admin_user),
    user_service: UserService = Depends(get_user_service),
):
    users, total = await user_service.get_user_list(
        page=page,
        page_size=page_size,
        keyword=keyword,
        role=role,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return ApiResponse.paginated(
        items=[UserListResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{user_id}", summary="获取用户详情(管理端)")
async def get_user_detail(
    user_id: int,
    admin_user: User = Depends(get_current_admin_user),
    user_service: UserService = Depends(get_user_service),
):
    user = await user_service.get_user_by_id(user_id)
    return ApiResponse.success(data=UserDetailResponse.model_validate(user))


@router.put("/{user_id}", summary="更新用户信息(管理端)")
async def update_user_by_admin(
    user_id: int,
    user_in: UserUpdateByAdmin,
    admin_user: User = Depends(get_current_admin_user),
    user_service: UserService = Depends(get_user_service),
):
    user = await user_service.update_user_by_admin(user_id, user_in)
    return ApiResponse.success(
        data=UserResponse.model_validate(user),
        message="更新成功"
    )


@router.delete("/{user_id}", summary="删除用户(管理端)")
async def delete_user(
    user_id: int,
    admin_user: User = Depends(get_current_admin_user),
    user_service: UserService = Depends(get_user_service),
):
    await user_service.delete_user(user_id)
    return ApiResponse.success(message="删除成功")


@router.post("/batch-delete", summary="批量删除用户(管理端)")
async def batch_delete_users(
    batch_in: BatchDeleteRequest,
    admin_user: User = Depends(get_current_admin_user),
    user_service: UserService = Depends(get_user_service),
):
    count = await user_service.batch_delete_users(batch_in.ids)
    return ApiResponse.success(
        data={
            "success_count": count,
            "failed_count": len(batch_in.ids) - count
        },
        message="批量删除成功"
    )
