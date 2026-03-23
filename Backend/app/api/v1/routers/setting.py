from fastapi import APIRouter, Depends
from app.schemas.setting import SettingsResponse, SettingsUpdate
from app.services.setting_service import SettingService
from app.models.user import User
from app.core.dependencies import (
    get_setting_service, get_current_admin_user
)
from app.utils.response import ApiResponse

router = APIRouter(prefix="/settings", tags=["系统设置"])


@router.get("", summary="获取系统设置")
async def get_settings(
    setting_service: SettingService = Depends(get_setting_service),
):
    settings = await setting_service.get_settings()
    return ApiResponse.success(data=settings)


@router.put("", summary="更新系统设置")
async def update_settings(
    settings_update: SettingsUpdate,
    current_user: User = Depends(get_current_admin_user),
    setting_service: SettingService = Depends(get_setting_service),
):
    updated = await setting_service.update_settings(settings_update)
    return ApiResponse.success(
        data=updated,
        message="更新成功"
    )
