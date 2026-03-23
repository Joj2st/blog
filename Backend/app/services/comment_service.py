from typing import Optional, List, Dict, Any
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_comment import crud_comment
from app.crud.crud_article import crud_article
from app.schemas.comment import CommentCreate, CommentUpdate, CommentWithReplies
from app.models.comment import Comment, CommentStatus
from app.models.user import User, UserRole


class CommentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_comment(
        self,
        comment_in: CommentCreate,
        article_id: int,
        user_id: int,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Comment:
        article = await crud_article.get_by_id(self.db, id=article_id)
        if not article:
            raise HTTPException(status_code=404, detail="文章不存在")

        if comment_in.parent_id:
            parent = await crud_comment.get_by_id(self.db, id=comment_in.parent_id)
            if not parent:
                raise HTTPException(status_code=404, detail="父评论不存在")
            if parent.article_id != article_id:
                raise HTTPException(status_code=400, detail="父评论不属于该文章")

        comment = await crud_comment.create_with_user(
            self.db,
            obj_in=comment_in,
            article_id=article_id,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        await self.db.commit()
        
        comment_with_user = await crud_comment.get_with_user(self.db, id=comment.id)
        
        article.comment_count += 1
        self.db.add(article)
        await self.db.commit()
        
        return comment_with_user

    async def get_comment_by_id(self, comment_id: int) -> Comment:
        comment = await crud_comment.get_with_user(self.db, id=comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="评论不存在")
        return comment

    async def get_comments_by_article(
        self,
        article_id: int,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[List[Dict[str, Any]], int]:
        article = await crud_article.get_by_id(self.db, id=article_id)
        if not article:
            raise HTTPException(status_code=404, detail="文章不存在")

        comments, total = await crud_comment.get_by_article(
            self.db,
            article_id=article_id,
            page=page,
            page_size=page_size,
            status=CommentStatus.approved,
        )

        result = []
        for comment in comments:
            replies = await crud_comment.get_replies(
                self.db,
                parent_id=comment.id,
                status=CommentStatus.approved,
            )
            
            reply_list = []
            for reply in replies:
                reply_list.append({
                    "id": reply.id,
                    "article_id": reply.article_id,
                    "user_id": reply.user_id,
                    "parent_id": reply.parent_id,
                    "reply_to_id": reply.reply_to_id,
                    "content": reply.content,
                    "status": reply.status,
                    "like_count": reply.like_count,
                    "created_at": reply.created_at,
                    "updated_at": reply.updated_at,
                    "user": {
                        "id": reply.user.id,
                        "nickname": reply.user.nickname,
                        "avatar": reply.user.avatar,
                    },
                    "reply_to": {
                        "id": reply.reply_to.id,
                        "nickname": reply.reply_to.nickname,
                    } if reply.reply_to else None,
                    "replies": [],
                    "reply_count": 0,
                })
            
            result.append({
                "id": comment.id,
                "article_id": comment.article_id,
                "user_id": comment.user_id,
                "parent_id": comment.parent_id,
                "reply_to_id": comment.reply_to_id,
                "content": comment.content,
                "status": comment.status,
                "like_count": comment.like_count,
                "created_at": comment.created_at,
                "updated_at": comment.updated_at,
                "user": {
                    "id": comment.user.id,
                    "nickname": comment.user.nickname,
                    "avatar": comment.user.avatar,
                },
                "reply_to": {
                    "id": comment.reply_to.id,
                    "nickname": comment.reply_to.nickname,
                } if comment.reply_to else None,
                "replies": reply_list,
                "reply_count": len(reply_list),
            })

        return result, total

    async def get_comments_by_user(
        self,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[List[Comment], int]:
        return await crud_comment.get_by_user(
            self.db,
            user_id=user_id,
            page=page,
            page_size=page_size,
        )

    async def update_comment(
        self,
        comment_id: int,
        comment_in: CommentUpdate,
        current_user: User,
    ) -> Comment:
        comment = await crud_comment.get_by_id(self.db, id=comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="评论不存在")

        if comment.user_id != current_user.id and current_user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="无权修改此评论")

        comment = await crud_comment.update(self.db, db_obj=comment, obj_in=comment_in)
        await self.db.commit()
        
        return await crud_comment.get_with_user(self.db, id=comment.id)

    async def delete_comment(
        self,
        comment_id: int,
        current_user: User,
    ) -> None:
        comment = await crud_comment.get_by_id(self.db, id=comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="评论不存在")

        if comment.user_id != current_user.id and current_user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="无权删除此评论")

        article = await crud_article.get_by_id(self.db, id=comment.article_id)
        
        reply_count = await crud_comment.get_reply_count(
            self.db, parent_id=comment_id, status=CommentStatus.approved
        )
        
        await crud_comment.delete(self.db, id=comment_id)
        await self.db.commit()

        if article:
            total_deleted = 1 + reply_count
            article.comment_count = max(0, article.comment_count - total_deleted)
            self.db.add(article)
            await self.db.commit()

    async def update_comment_status(
        self,
        comment_id: int,
        status: CommentStatus,
        current_user: User,
    ) -> Comment:
        if current_user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="需要管理员权限")

        comment = await crud_comment.get_by_id(self.db, id=comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="评论不存在")

        comment = await crud_comment.update_status(self.db, db_obj=comment, status=status)
        await self.db.commit()
        
        return await crud_comment.get_with_user(self.db, id=comment.id)

    async def like_comment(self, comment_id: int) -> Comment:
        comment = await crud_comment.get_by_id(self.db, id=comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="评论不存在")

        comment = await crud_comment.increment_like_count(self.db, comment=comment)
        await self.db.commit()
        
        return comment

    async def unlike_comment(self, comment_id: int) -> Comment:
        comment = await crud_comment.get_by_id(self.db, id=comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="评论不存在")

        comment = await crud_comment.decrement_like_count(self.db, comment=comment)
        await self.db.commit()
        
        return comment

    async def get_all_comments(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[CommentStatus] = None,
        keyword: Optional[str] = None,
        article_id: Optional[int] = None,
    ) -> tuple[List[Comment], int]:
        return await crud_comment.get_all_with_article(
            self.db,
            page=page,
            page_size=page_size,
            status=status,
            keyword=keyword,
            article_id=article_id,
        )
