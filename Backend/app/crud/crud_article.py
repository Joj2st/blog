from typing import List, Optional
from datetime import datetime
from sqlalchemy import select, func, delete, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.crud.base import CRUDBase
from app.models.article import Article, ArticleStatus
from app.models.user import User
from app.models.category import Tag
from app.schemas.article import ArticleCreate, ArticleUpdate


class CRUDArticle(CRUDBase[Article, ArticleCreate, ArticleUpdate]):
    async def create_with_author(
        self, db: AsyncSession, *, obj_in: ArticleCreate, author_id: int
    ) -> Article:
        # 从标题生成 slug
        slug = obj_in.slug
        if not slug:
            # 生成 slug：将标题转换为小写，替换空格为连字符，移除特殊字符
            import re
            slug = re.sub(r'[^a-zA-Z0-9\s]', '', obj_in.title)
            slug = slug.lower().replace(' ', '-')
            # 确保 slug 唯一
            original_slug = slug
            counter = 1
            while True:
                existing = await db.execute(
                    select(Article).filter(Article.slug == slug)
                )
                if not existing.scalars().first():
                    break
                slug = f"{original_slug}-{counter}"
                counter += 1
        
        db_obj = Article(
            title=obj_in.title,
            slug=slug,
            summary=obj_in.summary,
            content=obj_in.content,
            cover_image=obj_in.cover_image,
            category_id=obj_in.category_id,
            status=obj_in.status,
            is_top=obj_in.is_top,
            is_featured=obj_in.is_featured,
            author_id=author_id,
            published_at=datetime.utcnow() if obj_in.status == ArticleStatus.published else None,
        )
        db.add(db_obj)
        await db.flush()
        return db_obj

    async def get_with_author(self, db: AsyncSession, *, id: int) -> Optional[Article]:
        query = select(Article).options(
            selectinload(Article.author),
            selectinload(Article.category),
            selectinload(Article.tags)
        ).filter(Article.id == id)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_multi_with_author(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        status: Optional[ArticleStatus] = None,
    ) -> List[Article]:
        query = select(Article).options(selectinload(Article.author))
        if status:
            query = query.filter(Article.status == status)
        query = query.offset(skip).limit(limit).order_by(Article.created_at.desc())
        result = await db.execute(query)
        return result.scalars().all()

    async def get_multi_filtered(
        self,
        db: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 10,
        keyword: Optional[str] = None,
        status: Optional[ArticleStatus] = None,
        author_id: Optional[int] = None,
        category_id: Optional[int] = None,
        tag_id: Optional[int] = None,
        tag_ids: Optional[List[int]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> tuple[List[Article], int]:
        query = select(Article).options(
            selectinload(Article.author),
            selectinload(Article.category),
            selectinload(Article.tags)
        )
        count_query = select(func.count(Article.id))

        if keyword:
            keyword_filter = or_(
                Article.title.ilike(f"%{keyword}%"),
                Article.summary.ilike(f"%{keyword}%"),
                Article.content.ilike(f"%{keyword}%"),
            )
            query = query.filter(keyword_filter)
            count_query = count_query.filter(keyword_filter)

        if status:
            query = query.filter(Article.status == status)
            count_query = count_query.filter(Article.status == status)

        if author_id:
            query = query.filter(Article.author_id == author_id)
            count_query = count_query.filter(Article.author_id == author_id)

        if category_id:
            query = query.filter(Article.category_id == category_id)
            count_query = count_query.filter(Article.category_id == category_id)

        if tag_id:
            query = query.filter(Article.tags.any(Tag.id == tag_id))
            count_query = count_query.filter(Article.tags.any(Tag.id == tag_id))

        if tag_ids:
            for tid in tag_ids:
                query = query.filter(Article.tags.any(Tag.id == tid))
                count_query = count_query.filter(Article.tags.any(Tag.id == tid))

        if start_date:
            query = query.filter(Article.published_at >= start_date)
            count_query = count_query.filter(Article.published_at >= start_date)

        if end_date:
            query = query.filter(Article.published_at <= end_date)
            count_query = count_query.filter(Article.published_at <= end_date)

        sort_column = getattr(Article, sort_by, Article.created_at)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await db.execute(query)
        articles = result.scalars().all()

        count_result = await db.execute(count_query)
        total = count_result.scalar()

        return articles, total

    async def update_status(
        self, db: AsyncSession, *, db_obj: Article, status: ArticleStatus
    ) -> Article:
        db_obj.status = status
        if status == ArticleStatus.published and db_obj.published_at is None:
            db_obj.published_at = datetime.utcnow()
        db_obj.updated_at = datetime.utcnow()
        db.add(db_obj)
        await db.flush()
        return db_obj

    async def increment_view_count(self, db: AsyncSession, *, article: Article) -> Article:
        article.view_count += 1
        db.add(article)
        await db.flush()
        return article

    async def increment_like_count(self, db: AsyncSession, *, article: Article) -> Article:
        article.like_count += 1
        db.add(article)
        await db.flush()
        return article

    async def decrement_like_count(self, db: AsyncSession, *, article: Article) -> Article:
        if article.like_count > 0:
            article.like_count -= 1
            db.add(article)
            await db.flush()
        return article

    async def delete_multi(self, db: AsyncSession, *, ids: List[int]) -> int:
        query = delete(Article).filter(Article.id.in_(ids))
        result = await db.execute(query)
        return result.rowcount

    async def get_by_author(
        self,
        db: AsyncSession,
        *,
        author_id: int,
        page: int = 1,
        page_size: int = 10,
        status: Optional[ArticleStatus] = None,
    ) -> tuple[List[Article], int]:
        query = select(Article).options(selectinload(Article.author)).filter(Article.author_id == author_id)
        count_query = select(func.count(Article.id)).filter(Article.author_id == author_id)

        if status:
            query = query.filter(Article.status == status)
            count_query = count_query.filter(Article.status == status)

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size).order_by(Article.created_at.desc())

        result = await db.execute(query)
        articles = result.scalars().all()

        count_result = await db.execute(count_query)
        total = count_result.scalar()

        return articles, total


crud_article = CRUDArticle(Article)
