from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_popup import crud_popup
from app.models.popup import Popup, PopupType, PopupStatus
from app.schemas.popup import PopupCreate, PopupUpdate


class PopupService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_popup(self, popup_create: PopupCreate) -> Popup:
        popup = await crud_popup.create(self.db, obj_in=popup_create)
        await self.db.commit()
        await self.db.refresh(popup)
        return popup

    async def get_popup_list(
        self,
        page: int = 1,
        page_size: int = 10,
        type: Optional[PopupType] = None,
        status: Optional[PopupStatus] = None,
        keyword: Optional[str] = None,
    ) -> tuple[List[Popup], int]:
        return await crud_popup.get_multi_filtered(
            self.db,
            page=page,
            page_size=page_size,
            type=type,
            status=status,
            keyword=keyword,
        )

    async def get_popup_by_id(self, popup_id: int) -> Popup:
        popup = await crud_popup.get_by_id(self.db, id=popup_id)
        if not popup:
            raise HTTPException(status_code=404, detail="弹窗不存在")
        return popup

    async def get_active_popups(
        self,
        type: Optional[PopupType] = None,
    ) -> List[Popup]:
        return await crud_popup.get_active_popups(self.db, type=type)

    async def update_popup(self, popup_id: int, popup_update: PopupUpdate) -> Popup:
        popup = await self.get_popup_by_id(popup_id)
        popup = await crud_popup.update(self.db, db_obj=popup, obj_in=popup_update)
        await self.db.commit()
        await self.db.refresh(popup)
        return popup

    async def delete_popup(self, popup_id: int) -> None:
        popup = await self.get_popup_by_id(popup_id)
        await crud_popup.delete(self.db, id=popup.id)
        await self.db.commit()

    async def batch_delete_popups(self, ids: List[int]) -> dict:
        success_count = 0
        failed_count = 0

        for popup_id in ids:
            try:
                popup = await crud_popup.get_by_id(self.db, id=popup_id)
                if popup:
                    await crud_popup.delete(self.db, id=popup_id)
                    success_count += 1
                else:
                    failed_count += 1
            except Exception:
                failed_count += 1

        await self.db.commit()
        return {
            "success_count": success_count,
            "failed_count": failed_count,
        }

    async def record_show(self, popup_id: int) -> Popup:
        popup = await self.get_popup_by_id(popup_id)

        if popup.status != PopupStatus.active:
            raise HTTPException(status_code=400, detail="弹窗已禁用")

        if popup.max_show_count is not None and popup.current_show_count >= popup.max_show_count:
            raise HTTPException(status_code=400, detail="弹窗展示次数已达上限")

        popup = await crud_popup.increment_show_count(self.db, id=popup_id)
        await self.db.commit()
        return popup

    async def record_click(self, popup_id: int) -> Popup:
        popup = await self.get_popup_by_id(popup_id)

        if popup.status != PopupStatus.active:
            raise HTTPException(status_code=400, detail="弹窗已禁用")

        if popup.max_click_count is not None and popup.current_click_count >= popup.max_click_count:
            raise HTTPException(status_code=400, detail="弹窗点击次数已达上限")

        popup = await crud_popup.increment_click_count(self.db, id=popup_id)
        await self.db.commit()
        return popup

    async def update_sort_order(self, items: List[dict]) -> int:
        count = await crud_popup.update_sort_order(self.db, items=items)
        await self.db.commit()
        return count
