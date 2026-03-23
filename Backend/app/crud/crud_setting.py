from typing import Optional, List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.base import CRUDBase
from app.models.setting import Setting, SettingType
from app.schemas.setting import SettingItem


class CRUDSetting(CRUDBase[Setting, SettingItem, SettingItem]):
    async def get_by_key(self, db: AsyncSession, *, key: str) -> Optional[Setting]:
        query = select(Setting).filter(Setting.setting_key == key)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_all_as_dict(self, db: AsyncSession) -> Dict[str, Any]:
        query = select(Setting)
        result = await db.execute(query)
        settings = result.scalars().all()
        
        settings_dict = {}
        for setting in settings:
            value = self._parse_value(setting.setting_value, setting.setting_type)
            settings_dict[setting.setting_key] = value
        
        return settings_dict

    def _parse_value(self, value: Optional[str], setting_type: SettingType) -> Any:
        if value is None:
            return None
        
        if setting_type == SettingType.int:
            try:
                return int(value)
            except (ValueError, TypeError):
                return 0
        elif setting_type == SettingType.bool:
            return value.lower() in ("true", "1", "yes")
        elif setting_type == SettingType.json:
            import json
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return {}
        else:
            return value

    async def set_value(
        self,
        db: AsyncSession,
        *,
        key: str,
        value: Any,
        setting_type: SettingType = SettingType.string,
        description: Optional[str] = None,
    ) -> Setting:
        existing = await self.get_by_key(db, key=key)
        
        str_value = self._to_string(value, setting_type)
        
        if existing:
            existing.setting_value = str_value
            existing.setting_type = setting_type
            if description is not None:
                existing.description = description
            db.add(existing)
            await db.flush()
            return existing
        else:
            new_setting = Setting(
                setting_key=key,
                setting_value=str_value,
                setting_type=setting_type,
                description=description,
            )
            db.add(new_setting)
            await db.flush()
            return new_setting

    def _to_string(self, value: Any, setting_type: SettingType) -> str:
        if value is None:
            return ""
        
        if setting_type == SettingType.json:
            import json
            return json.dumps(value, ensure_ascii=False)
        elif setting_type == SettingType.bool:
            return "true" if value else "false"
        else:
            return str(value)

    async def set_multiple(
        self,
        db: AsyncSession,
        *,
        settings: Dict[str, Any],
        type_mapping: Optional[Dict[str, SettingType]] = None,
    ) -> List[Setting]:
        if type_mapping is None:
            type_mapping = {}
        
        results = []
        for key, value in settings.items():
            setting_type = type_mapping.get(key, self._infer_type(value))
            setting = await self.set_value(db, key=key, value=value, setting_type=setting_type)
            results.append(setting)
        
        return results

    def _infer_type(self, value: Any) -> SettingType:
        if isinstance(value, bool):
            return SettingType.bool
        elif isinstance(value, int):
            return SettingType.int
        elif isinstance(value, (dict, list)):
            return SettingType.json
        else:
            return SettingType.string


crud_setting = CRUDSetting(Setting)
