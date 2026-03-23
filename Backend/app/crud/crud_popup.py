from typing import List, Optional
from datetime import datetime
from sqlalchemy import select, func, delete, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.base import CRUDBase
from app.models.popup import Popup, PopupType, PopupStatus, ShowFrequency
from app.schemas.popup import PopupCreate, PopupUpdate


class CRUDPopup(CRUDBase[Popup, PopupCreate, PopupUpdate]):
    async def get_multi_filtered(
        self,
        db: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 10,
        type: Optional[PopupType] = None,
        status: Optional[PopupStatus] = None,
        keyword: Optional[str] = None,
    ) -> tuple[List[Popup], int]:
        query = select(Popup)
        count_query = select(func.count(Popup.id))

        if type:
            query = query.filter(Popup.type == type)
            count_query = count_query.filter(Popup.type == type)

        if status:
            query = query.filter(Popup.status == status)
            count_query = count_query.filter(Popup.status == status)

        if keyword:
            keyword_filter = or_(
                Popup.title.ilike(f"%{keyword}%"),
                Popup.content.ilike(f"%{keyword}%"),
            )
            query = query.filter(keyword_filter)
            count_query = count_query.filter(keyword_filter)

        query = query.order_by(Popup.sort_order.desc(), Popup.created_at.desc())

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await db.execute(query)
        popup_list = result.scalars().all()

        count_result = await db.execute(count_query)
        total = count_result.scalar()

        return popup_list, total

    async def get_active_popups(
        self,
        db: AsyncSession,
        *,
        type: Optional[PopupType] = None,
    ) -> List[Popup]:
        now = datetime.utcnow()

        query = select(Popup).filter(
            and_(
                Popup.status == PopupStatus.active,
                or_(Popup.start_time.is_(None), Popup.start_time <= now),
                or_(Popup.end_time.is_(None), Popup.end_time >= now),
                or_(Popup.max_show_count.is_(None), Popup.current_show_count < Popup.max_show_count),
            )
        )

        if type:
            query = query.filter(Popup.type == type)

        query = query.order_by(Popup.sort_order.desc(), Popup.created_at.desc())

        result = await db.execute(query)
        return result.scalars().all()

    async def increment_show_count(self, db: AsyncSession, *, id: int) -> Optional[Popup]:
        popup = await self.get_by_id(db, id=id)
        if popup:
            popup.current_show_count += 1
            await db.flush()
        return popup

    async def increment_click_count(self, db: AsyncSession, *, id: int) -> Optional[Popup]:
        popup = await self.get_by_id(db, id=id)
        if popup:
            popup.current_click_count += 1
            await db.flush()
        return popup

    async def update_sort_order(
        self,
        db: AsyncSession,
        *,
        items: List[dict],
    ) -> int:
        updated_count = 0
        for item in items:
            popup = await self.get_by_id(db, id=item["id"])
            if popup:
                popup.sort_order = item["sort_order"]
                updated_count += 1
        await db.flush()
        return updated_count

    async def delete_multi(self, db: AsyncSession, *, ids: List[int]) -> int:
        query = delete(Popup).filter(Popup.id.in_(ids))
        result = await db.execute(query)
        return result.rowcount


crud_popup = CRUDPopup(Popup)
