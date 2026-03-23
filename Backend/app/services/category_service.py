from typing import List, Optional, Dict
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.crud_category import crud_category, crud_tag
from app.schemas.category import (
    CategoryCreate, CategoryUpdate, CategoryResponse, CategoryTreeResponse,
    TagCreate, TagUpdate, TagResponse
)
from app.models.category import Category, Tag


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_category_list(
        self,
        parent_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Category]:
        return await crud_category.get_multi_with_children(
            self.db, parent_id=parent_id, skip=skip, limit=limit
        )

    async def get_category_tree(self) -> List[CategoryTreeResponse]:
        all_categories = await crud_category.get_tree(self.db)
        
        category_map: Dict[int, CategoryTreeResponse] = {}
        root_categories: List[CategoryTreeResponse] = []
        
        for cat in all_categories:
            category_map[cat.id] = CategoryTreeResponse(
                id=cat.id,
                name=cat.name,
                slug=cat.slug,
                description=cat.description,
                parent_id=cat.parent_id,
                sort_order=cat.sort_order,
                article_count=cat.article_count,
                created_at=cat.created_at,
                children=[]
            )
        
        for cat in all_categories:
            cat_response = category_map[cat.id]
            if cat.parent_id is None:
                root_categories.append(cat_response)
            elif cat.parent_id in category_map:
                category_map[cat.parent_id].children.append(cat_response)
        
        return root_categories

    async def get_category_by_id(self, category_id: int) -> Category:
        category = await crud_category.get_by_id(self.db, id=category_id)
        if not category:
            raise HTTPException(status_code=404, detail="分类不存在")
        return category

    async def get_category_by_slug(self, slug: str) -> Category:
        category = await crud_category.get_by_slug(self.db, slug=slug)
        if not category:
            raise HTTPException(status_code=404, detail="分类不存在")
        return category

    async def create_category(self, category_in: CategoryCreate) -> Category:
        existing = await crud_category.get_by_slug(self.db, slug=category_in.slug)
        if existing:
            raise HTTPException(status_code=400, detail="分类别名已存在")
        
        category = await crud_category.create(self.db, obj_in=category_in)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def update_category(
        self,
        category_id: int,
        category_in: CategoryUpdate,
    ) -> Category:
        category = await self.get_category_by_id(category_id)
        
        if category_in.slug and category_in.slug != category.slug:
            existing = await crud_category.get_by_slug(self.db, slug=category_in.slug)
            if existing:
                raise HTTPException(status_code=400, detail="分类别名已存在")
        
        category = await crud_category.update(
            self.db, db_obj=category, obj_in=category_in
        )
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def delete_category(self, category_id: int) -> None:
        category = await self.get_category_by_id(category_id)
        
        if category.article_count > 0:
            raise HTTPException(status_code=400, detail="该分类下还有文章，无法删除")
        
        await crud_category.delete(self.db, id=category_id)
        await self.db.commit()


class TagService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_tag_list(
        self,
        skip: int = 0,
        limit: int = 100,
        order_by: str = "article_count",
        order: str = "desc",
    ) -> List[Tag]:
        return await crud_tag.get_multi_ordered(
            self.db, skip=skip, limit=limit, order_by=order_by, order=order
        )

    async def get_popular_tags(self, limit: int = 10) -> List[Tag]:
        return await crud_tag.get_popular_tags(self.db, limit=limit)

    async def get_tag_by_id(self, tag_id: int) -> Tag:
        tag = await crud_tag.get_by_id(self.db, id=tag_id)
        if not tag:
            raise HTTPException(status_code=404, detail="标签不存在")
        return tag

    async def get_tag_by_slug(self, slug: str) -> Tag:
        tag = await crud_tag.get_by_slug(self.db, slug=slug)
        if not tag:
            raise HTTPException(status_code=404, detail="标签不存在")
        return tag

    async def create_tag(self, tag_in: TagCreate) -> Tag:
        existing_slug = await crud_tag.get_by_slug(self.db, slug=tag_in.slug)
        if existing_slug:
            raise HTTPException(status_code=400, detail="标签别名已存在")
        
        existing_name = await crud_tag.get_by_name(self.db, name=tag_in.name)
        if existing_name:
            raise HTTPException(status_code=400, detail="标签名称已存在")
        
        tag = await crud_tag.create(self.db, obj_in=tag_in)
        await self.db.commit()
        await self.db.refresh(tag)
        return tag

    async def update_tag(self, tag_id: int, tag_in: TagUpdate) -> Tag:
        tag = await self.get_tag_by_id(tag_id)
        
        if tag_in.slug and tag_in.slug != tag.slug:
            existing = await crud_tag.get_by_slug(self.db, slug=tag_in.slug)
            if existing:
                raise HTTPException(status_code=400, detail="标签别名已存在")
        
        if tag_in.name and tag_in.name != tag.name:
            existing = await crud_tag.get_by_name(self.db, name=tag_in.name)
            if existing:
                raise HTTPException(status_code=400, detail="标签名称已存在")
        
        tag = await crud_tag.update(self.db, db_obj=tag, obj_in=tag_in)
        await self.db.commit()
        await self.db.refresh(tag)
        return tag

    async def delete_tag(self, tag_id: int) -> None:
        tag = await self.get_tag_by_id(tag_id)
        
        if tag.article_count > 0:
            raise HTTPException(status_code=400, detail="该标签下还有文章，无法删除")
        
        await crud_tag.delete(self.db, id=tag_id)
        await self.db.commit()
