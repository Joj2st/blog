from typing import List, Optional
from datetime import datetime
from sqlalchemy import select, func, delete, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.crud.base import CRUDBase
from app.models.media import Media, MediaType
from app.schemas.media import MediaCreate
from app.models.user import User


class CRUDMedia(CRUDBase[Media, MediaCreate, MediaCreate]):
    async def create_with_uploader(
        self,
        db: AsyncSession,
        *,
        filename: str,
        original_name: str,
        path: str,
        url: str,
        mime_type: str,
        size: int,
        uploader_id: int,
        width: Optional[int] = None,
        height: Optional[int] = None,
        type: MediaType = MediaType.image,
    ) -> Media:
        db_obj = Media(
            filename=filename,
            original_name=original_name,
            path=path,
            url=url,
            mime_type=mime_type,
            size=size,
            width=width,
            height=height,
            type=type,
            uploader_id=uploader_id,
        )
        db.add(db_obj)
        await db.flush()
        return db_obj

    async def get_with_uploader(self, db: AsyncSession, *, id: int) -> Optional[Media]:
        query = select(Media).options(
            selectinload(Media.uploader)
        ).filter(Media.id == id)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_multi_filtered(
        self,
        db: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 20,
        type: Optional[MediaType] = None,
        keyword: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        uploader_id: Optional[int] = None,
    ) -> tuple[List[Media], int]:
        query = select(Media).options(
            selectinload(Media.uploader)
        )
        count_query = select(func.count(Media.id))

        if type:
            query = query.filter(Media.type == type)
            count_query = count_query.filter(Media.type == type)

        if keyword:
            keyword_filter = or_(
                Media.filename.ilike(f"%{keyword}%"),
                Media.original_name.ilike(f"%{keyword}%"),
            )
            query = query.filter(keyword_filter)
            count_query = count_query.filter(keyword_filter)

        if start_date:
            query = query.filter(Media.created_at >= start_date)
            count_query = count_query.filter(Media.created_at >= start_date)

        if end_date:
            query = query.filter(Media.created_at <= end_date)
            count_query = count_query.filter(Media.created_at <= end_date)

        if uploader_id:
            query = query.filter(Media.uploader_id == uploader_id)
            count_query = count_query.filter(Media.uploader_id == uploader_id)

        query = query.order_by(Media.created_at.desc())

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await db.execute(query)
        media_list = result.scalars().all()

        count_result = await db.execute(count_query)
        total = count_result.scalar()

        return media_list, total

    async def delete_multi(self, db: AsyncSession, *, ids: List[int]) -> int:
        query = delete(Media).filter(Media.id.in_(ids))
        result = await db.execute(query)
        return result.rowcount

    async def get_by_uploader(
        self,
        db: AsyncSession,
        *,
        uploader_id: int,
        page: int = 1,
        page_size: int = 20,
        type: Optional[MediaType] = None,
    ) -> tuple[List[Media], int]:
        query = select(Media).options(
            selectinload(Media.uploader)
        ).filter(Media.uploader_id == uploader_id)
        count_query = select(func.count(Media.id)).filter(Media.uploader_id == uploader_id)

        if type:
            query = query.filter(Media.type == type)
            count_query = count_query.filter(Media.type == type)

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size).order_by(Media.created_at.desc())

        result = await db.execute(query)
        media_list = result.scalars().all()

        count_result = await db.execute(count_query)
        total = count_result.scalar()

        return media_list, total


crud_media = CRUDMedia(Media)
