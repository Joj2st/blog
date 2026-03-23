from typing import Optional, List
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_article import crud_article
from app.schemas.article import ArticleCreate, ArticleUpdate
from app.models.article import Article, ArticleStatus
from app.models.user import User, UserRole


class ArticleService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_article_list(
        self,
        page: int = 1,
        page_size: int = 10,
        keyword: Optional[str] = None,
        status: Optional[ArticleStatus] = None,
        author_id: Optional[int] = None,
        category_id: Optional[int] = None,
        tag_id: Optional[int] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> tuple[List[Article], int]:
        return await crud_article.get_multi_filtered(
            self.db,
            page=page,
            page_size=page_size,
            keyword=keyword,
            status=status,
            author_id=author_id,
            category_id=category_id,
            tag_id=tag_id,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    async def search_articles(
        self,
        keyword: str,
        page: int = 1,
        page_size: int = 10,
        status: Optional[ArticleStatus] = None,
    ) -> tuple[List[Article], int]:
        search_status = status or ArticleStatus.published
        return await crud_article.get_multi_filtered(
            self.db,
            page=page,
            page_size=page_size,
            keyword=keyword,
            status=search_status,
        )

    async def advanced_search(
        self,
        page: int = 1,
        page_size: int = 10,
        keyword: Optional[str] = None,
        status: Optional[ArticleStatus] = None,
        category_id: Optional[int] = None,
        tag_ids: Optional[List[int]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sort_by: str = "published_at",
        sort_order: str = "desc",
    ) -> tuple[List[Article], int]:
        return await crud_article.get_multi_filtered(
            self.db,
            page=page,
            page_size=page_size,
            keyword=keyword,
            status=status,
            category_id=category_id,
            tag_ids=tag_ids,
            start_date=start_date,
            end_date=end_date,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    async def get_my_articles(
        self,
        user_id: int,
        page: int = 1,
        page_size: int = 10,
        status: Optional[ArticleStatus] = None,
    ) -> tuple[List[Article], int]:
        return await crud_article.get_by_author(
            self.db,
            author_id=user_id,
            page=page,
            page_size=page_size,
            status=status,
        )

    async def create_article(
        self,
        article_in: ArticleCreate,
        author_id: int,
    ) -> Article:
        article = await crud_article.create_with_author(
            self.db, obj_in=article_in, author_id=author_id
        )
        await self.db.commit()
        await self.db.refresh(article)
        
        article_with_author = await crud_article.get_with_author(self.db, id=article.id)
        return article_with_author

    async def get_article_detail(self, article_id: int) -> Article:
        article = await crud_article.get_with_author(self.db, id=article_id)
        if not article:
            raise HTTPException(status_code=404, detail="文章不存在")
        
        await crud_article.increment_view_count(self.db, article=article)
        await self.db.commit()
        
        return article

    async def update_article(
        self,
        article_id: int,
        article_in: ArticleUpdate,
        current_user: User,
    ) -> Article:
        article = await crud_article.get_with_author(self.db, id=article_id)
        if not article:
            raise HTTPException(status_code=404, detail="文章不存在")
        
        if article.author_id != current_user.id and current_user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="无权修改此文章")
        
        update_data = article_in.model_dump(exclude_unset=True)
        
        if article_in.status == ArticleStatus.published and article.status != ArticleStatus.published:
            update_data["published_at"] = datetime.utcnow()
        
        article = await crud_article.update(self.db, db_obj=article, obj_in=update_data)
        await self.db.commit()
        await self.db.refresh(article)
        
        article_with_author = await crud_article.get_with_author(self.db, id=article.id)
        return article_with_author

    async def delete_article(
        self,
        article_id: int,
        current_user: User,
    ) -> None:
        article = await crud_article.get_by_id(self.db, id=article_id)
        if not article:
            raise HTTPException(status_code=404, detail="文章不存在")
        
        if article.author_id != current_user.id and current_user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="无权删除此文章")
        
        await crud_article.delete(self.db, id=article_id)
        await self.db.commit()

    async def publish_article(
        self,
        article_id: int,
        current_user: User,
    ) -> Article:
        article = await crud_article.get_by_id(self.db, id=article_id)
        if not article:
            raise HTTPException(status_code=404, detail="文章不存在")
        
        if article.author_id != current_user.id and current_user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="无权发布此文章")
        
        article = await crud_article.update_status(
            self.db, db_obj=article, status=ArticleStatus.published
        )
        await self.db.commit()
        await self.db.refresh(article)
        
        return article

    async def archive_article(
        self,
        article_id: int,
        current_user: User,
    ) -> Article:
        article = await crud_article.get_by_id(self.db, id=article_id)
        if not article:
            raise HTTPException(status_code=404, detail="文章不存在")
        
        if article.author_id != current_user.id and current_user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="无权归档此文章")
        
        article = await crud_article.update_status(
            self.db, db_obj=article, status=ArticleStatus.archived
        )
        await self.db.commit()
        await self.db.refresh(article)
        
        return article

    async def increment_like(self, article_id: int) -> Article:
        article = await crud_article.get_by_id(self.db, id=article_id)
        if not article:
            raise HTTPException(status_code=404, detail="文章不存在")
        
        article = await crud_article.increment_like_count(self.db, article=article)
        await self.db.commit()
        
        return article

    async def decrement_like(self, article_id: int) -> Article:
        article = await crud_article.get_by_id(self.db, id=article_id)
        if not article:
            raise HTTPException(status_code=404, detail="文章不存在")
        
        article = await crud_article.decrement_like_count(self.db, article=article)
        await self.db.commit()
        
        return article

    async def batch_delete_articles(self, ids: List[int]) -> int:
        count = await crud_article.delete_multi(self.db, ids=ids)
        await self.db.commit()
        return count

    async def batch_operation(
        self,
        ids: List[int],
        action: str,
        category_id: Optional[int] = None,
    ) -> dict:
        success_count = 0
        failed_count = 0
        
        for article_id in ids:
            try:
                article = await crud_article.get_by_id(self.db, id=article_id)
                if not article:
                    failed_count += 1
                    continue
                
                if action == "publish":
                    await crud_article.update_status(
                        self.db, db_obj=article, status=ArticleStatus.published
                    )
                elif action == "draft":
                    await crud_article.update_status(
                        self.db, db_obj=article, status=ArticleStatus.draft
                    )
                elif action == "archive":
                    await crud_article.update_status(
                        self.db, db_obj=article, status=ArticleStatus.archived
                    )
                elif action == "delete":
                    await crud_article.delete(self.db, id=article_id)
                elif action == "move":
                    if category_id is None:
                        failed_count += 1
                        continue
                    article.category_id = category_id
                    self.db.add(article)
                
                success_count += 1
            except Exception:
                failed_count += 1
        
        await self.db.commit()
        return {"success_count": success_count, "failed_count": failed_count}

    async def is_article_in_guest_list(self, article_id: int) -> bool:
        articles, _ = await crud_article.get_multi_filtered(
            self.db,
            page=1,
            page_size=10,
            status=ArticleStatus.published,
            sort_by="published_at",
            sort_order="desc",
        )
        allowed_ids = [a.id for a in articles]
        return article_id in allowed_ids
