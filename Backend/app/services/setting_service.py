from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_setting import crud_setting
from app.models.setting import SettingType
from app.schemas.setting import SettingsResponse, SettingsUpdate


DEFAULT_SETTINGS = {
    "site_name": ("我的博客", SettingType.string, "网站名称"),
    "site_description": ("一个技术博客", SettingType.string, "网站描述"),
    "site_keywords": ("技术,博客,编程", SettingType.string, "网站关键词"),
    "site_logo": ("", SettingType.string, "网站Logo"),
    "site_favicon": ("", SettingType.string, "网站图标"),
    "site_icp": ("", SettingType.string, "ICP备案号"),
    "comment_enabled": ("true", SettingType.bool, "是否开启评论"),
    "comment_audit": ("true", SettingType.bool, "评论是否需要审核"),
    "register_enabled": ("true", SettingType.bool, "是否开放注册"),
    "email_notify": ("false", SettingType.bool, "是否开启邮件通知"),
    "footer_text": ("Copyright © 2024", SettingType.string, "页脚文字"),
    "social_links": ("{}", SettingType.json, "社交链接"),
}

SETTINGS_TYPE_MAPPING = {
    "site_name": SettingType.string,
    "site_description": SettingType.string,
    "site_keywords": SettingType.string,
    "site_logo": SettingType.string,
    "site_favicon": SettingType.string,
    "site_icp": SettingType.string,
    "comment_enabled": SettingType.bool,
    "comment_audit": SettingType.bool,
    "register_enabled": SettingType.bool,
    "email_notify": SettingType.bool,
    "footer_text": SettingType.string,
    "social_links": SettingType.json,
}


class SettingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_settings(self) -> SettingsResponse:
        await self._ensure_default_settings()
        
        settings_dict = await crud_setting.get_all_as_dict(self.db)
        
        return SettingsResponse(
            site_name=settings_dict.get("site_name", "我的博客"),
            site_description=settings_dict.get("site_description"),
            site_keywords=settings_dict.get("site_keywords"),
            site_logo=settings_dict.get("site_logo"),
            site_favicon=settings_dict.get("site_favicon"),
            site_icp=settings_dict.get("site_icp"),
            comment_enabled=settings_dict.get("comment_enabled", True),
            comment_audit=settings_dict.get("comment_audit", True),
            register_enabled=settings_dict.get("register_enabled", True),
            email_notify=settings_dict.get("email_notify", False),
            footer_text=settings_dict.get("footer_text"),
            social_links=settings_dict.get("social_links"),
        )

    async def update_settings(self, settings_update: SettingsUpdate) -> Dict[str, Any]:
        await self._ensure_default_settings()
        
        update_data = settings_update.model_dump(exclude_unset=True)
        
        if not update_data:
            return {}
        
        type_mapping = {k: SETTINGS_TYPE_MAPPING.get(k, SettingType.string) for k in update_data}
        
        await crud_setting.set_multiple(
            self.db,
            settings=update_data,
            type_mapping=type_mapping,
        )
        
        await self.db.commit()
        
        return update_data

    async def _ensure_default_settings(self) -> None:
        for key, (default_value, setting_type, description) in DEFAULT_SETTINGS.items():
            existing = await crud_setting.get_by_key(self.db, key=key)
            if not existing:
                await crud_setting.set_value(
                    self.db,
                    key=key,
                    value=default_value,
                    setting_type=setting_type,
                    description=description,
                )
        
        await self.db.commit()

    async def get_setting(self, key: str) -> Any:
        setting = await crud_setting.get_by_key(self.db, key=key)
        if setting:
            return crud_setting._parse_value(setting.setting_value, setting.setting_type)
        return None

    async def set_setting(self, key: str, value: Any, description: str = None) -> None:
        setting_type = SETTINGS_TYPE_MAPPING.get(key, crud_setting._infer_type(value))
        await crud_setting.set_value(
            self.db,
            key=key,
            value=value,
            setting_type=setting_type,
            description=description,
        )
        await self.db.commit()
