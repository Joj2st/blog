from typing import List, Optional
from sqlalchemy import select, func, delete, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.crud.base import CRUDBase
from app.models.comment import Comment, CommentStatus
from app.models.user import User
from app.models.article import Article
from app.schemas.comment import CommentCreate, CommentUpdate


class CRUDComment(CRUDBase[Comment, CommentCreate, CommentUpdate]):
    async def create_with_user(
        self,
        db: AsyncSession,
        *,
        obj_in: CommentCreate,
        article_id: int,
        user_id: int,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Comment:
        db_obj = Comment(
            article_id=article_id,
            user_id=user_id,
            parent_id=obj_in.parent_id,
            reply_to_id=obj_in.reply_to_id,
            content=obj_in.content,
            status=CommentStatus.approved,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(db_obj)
        await db.flush()
        return db_obj

    async def get_with_user(self, db: AsyncSession, *, id: int) -> Optional[Comment]:
        query = select(Comment).options(
            selectinload(Comment.user),
            selectinload(Comment.reply_to)
        ).filter(Comment.id == id)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_by_article(
        self,
        db: AsyncSession,
        *,
        article_id: int,
        page: int = 1,
        page_size: int = 20,
        status: Optional[CommentStatus] = None,
    ) -> tuple[List[Comment], int]:
        query = select(Comment).options(
            selectinload(Comment.user),
            selectinload(Comment.reply_to)
        ).filter(Comment.article_id == article_id, Comment.parent_id.is_(None))
        
        count_query = select(func.count(Comment.id)).filter(
            Comment.article_id == article_id,
            Comment.parent_id.is_(None)
        )

        if status:
            query = query.filter(Comment.status == status)
            count_query = count_query.filter(Comment.status == status)

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size).order_by(Comment.created_at.desc())

        result = await db.execute(query)
        comments = result.scalars().all()

        count_result = await db.execute(count_query)
        total = count_result.scalar()

        return comments, total

    async def get_replies(
        self,
        db: AsyncSession,
        *,
        parent_id: int,
        status: Optional[CommentStatus] = None,
    ) -> List[Comment]:
        query = select(Comment).options(
            selectinload(Comment.user),
            selectinload(Comment.reply_to)
        ).filter(Comment.parent_id == parent_id)

        if status:
            query = query.filter(Comment.status == status)

        query = query.order_by(Comment.created_at.asc())
        result = await db.execute(query)
        return result.scalars().all()

    async def get_reply_count(
        self,
        db: AsyncSession,
        *,
        parent_id: int,
        status: Optional[CommentStatus] = None,
    ) -> int:
        query = select(func.count(Comment.id)).filter(Comment.parent_id == parent_id)
        if status:
            query = query.filter(Comment.status == status)
        result = await db.execute(query)
        return result.scalar() or 0

    async def get_by_user(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[List[Comment], int]:
        query = select(Comment).options(
            selectinload(Comment.user)
        ).filter(Comment.user_id == user_id)
        
        count_query = select(func.count(Comment.id)).filter(Comment.user_id == user_id)

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size).order_by(Comment.created_at.desc())

        result = await db.execute(query)
        comments = result.scalars().all()

        count_result = await db.execute(count_query)
        total = count_result.scalar()

        return comments, total

    async def update_status(
        self, db: AsyncSession, *, db_obj: Comment, status: CommentStatus
    ) -> Comment:
        db_obj.status = status
        db.add(db_obj)
        await db.flush()
        return db_obj

    async def increment_like_count(self, db: AsyncSession, *, comment: Comment) -> Comment:
        comment.like_count += 1
        db.add(comment)
        await db.flush()
        return comment

    async def decrement_like_count(self, db: AsyncSession, *, comment: Comment) -> Comment:
        if comment.like_count > 0:
            comment.like_count -= 1
            db.add(comment)
            await db.flush()
        return comment

    async def count_by_article(
        self,
        db: AsyncSession,
        *,
        article_id: int,
        status: Optional[CommentStatus] = None,
    ) -> int:
        query = select(func.count(Comment.id)).filter(Comment.article_id == article_id)
        if status:
            query = query.filter(Comment.status == status)
        result = await db.execute(query)
        return result.scalar() or 0

    async def delete_by_article(self, db: AsyncSession, *, article_id: int) -> int:
        query = delete(Comment).filter(Comment.article_id == article_id)
        result = await db.execute(query)
        return result.rowcount

    async def get_all_with_article(
        self,
        db: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 20,
        status: Optional[CommentStatus] = None,
        keyword: Optional[str] = None,
        article_id: Optional[int] = None,
    ) -> tuple[List[Comment], int]:
        query = select(Comment).options(
            selectinload(Comment.user),
            selectinload(Comment.article)
        )
        
        count_query = select(func.count(Comment.id))

        if status:
            query = query.filter(Comment.status == status)
            count_query = count_query.filter(Comment.status == status)

        if article_id:
            query = query.filter(Comment.article_id == article_id)
            count_query = count_query.filter(Comment.article_id == article_id)

        if keyword:
            keyword_filter = or_(
                Comment.content.ilike(f"%{keyword}%"),
            )
            query = query.filter(keyword_filter)
            count_query = count_query.filter(keyword_filter)

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size).order_by(Comment.created_at.desc())

        result = await db.execute(query)
        comments = result.scalars().all()

        count_result = await db.execute(count_query)
        total = count_result.scalar()

        return comments, total


crud_comment = CRUDComment(Comment)
