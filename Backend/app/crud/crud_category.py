from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from app.crud.base import CRUDBase
from app.models.category import Category, Tag
from app.schemas.category import CategoryCreate, CategoryUpdate, TagCreate, TagUpdate


class CRUDCategory(CRUDBase[Category, CategoryCreate, CategoryUpdate]):
    async def get_by_slug(self, db: AsyncSession, *, slug: str) -> Optional[Category]:
        result = await db.execute(
            select(Category).where(Category.slug == slug)
        )
        return result.scalar_one_or_none()

    async def get_multi_with_children(
        self,
        db: AsyncSession,
        *,
        parent_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Category]:
        query = select(Category)
        if parent_id is None:
            query = query.where(Category.parent_id.is_(None))
        else:
            query = query.where(Category.parent_id == parent_id)
        query = query.order_by(Category.sort_order.asc(), Category.created_at.desc())
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def get_tree(self, db: AsyncSession) -> List[Category]:
        result = await db.execute(
            select(Category)
            .order_by(Category.sort_order.asc(), Category.created_at.desc())
        )
        return result.scalars().all()

    async def get_with_article_count(
        self,
        db: AsyncSession,
        *,
        category_id: int,
    ) -> Optional[Category]:
        result = await db.execute(
            select(Category).where(Category.id == category_id)
        )
        return result.scalar_one_or_none()

    async def increment_article_count(self, db: AsyncSession, *, category: Category) -> Category:
        category.article_count += 1
        db.add(category)
        await db.flush()
        return category

    async def decrement_article_count(self, db: AsyncSession, *, category: Category) -> Category:
        if category.article_count > 0:
            category.article_count -= 1
        db.add(category)
        await db.flush()
        return category


class CRUDTag(CRUDBase[Tag, TagCreate, TagUpdate]):
    async def get_by_slug(self, db: AsyncSession, *, slug: str) -> Optional[Tag]:
        result = await db.execute(
            select(Tag).where(Tag.slug == slug)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, db: AsyncSession, *, name: str) -> Optional[Tag]:
        result = await db.execute(
            select(Tag).where(Tag.name == name)
        )
        return result.scalar_one_or_none()

    async def get_multi_ordered(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        order_by: str = "article_count",
        order: str = "desc",
    ) -> List[Tag]:
        query = select(Tag)
        
        order_column = getattr(Tag, order_by, Tag.article_count)
        if order == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def get_popular_tags(
        self,
        db: AsyncSession,
        *,
        limit: int = 10,
    ) -> List[Tag]:
        result = await db.execute(
            select(Tag)
            .order_by(Tag.article_count.desc())
            .limit(limit)
        )
        return result.scalars().all()

    async def increment_article_count(self, db: AsyncSession, *, tag: Tag) -> Tag:
        tag.article_count += 1
        db.add(tag)
        await db.flush()
        return tag

    async def decrement_article_count(self, db: AsyncSession, *, tag: Tag) -> Tag:
        if tag.article_count > 0:
            tag.article_count -= 1
        db.add(tag)
        await db.flush()
        return tag


crud_category = CRUDCategory(Category)
crud_tag = CRUDTag(Tag)
