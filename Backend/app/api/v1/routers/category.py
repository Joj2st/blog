from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.schemas.category import (
    CategoryCreate, CategoryUpdate, CategoryResponse, CategoryTreeResponse,
    TagCreate, TagUpdate, TagResponse
)
from app.services.category_service import CategoryService, TagService
from app.models.user import User
from app.core.dependencies import (
    get_category_service, get_tag_service,
    get_current_admin_user
)
from app.utils.response import ApiResponse

router = APIRouter(prefix="/categories", tags=["分类"])


@router.get("", summary="获取分类列表")
async def get_category_list(
    parent_id: Optional[int] = Query(None, description="父分类ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category_service: CategoryService = Depends(get_category_service),
):
    categories = await category_service.get_category_list(
        parent_id=parent_id,
        skip=skip,
        limit=limit,
    )
    return ApiResponse.success(
        data=[CategoryResponse.model_validate(c) for c in categories]
    )


@router.get("/tree", summary="获取分类树")
async def get_category_tree(
    category_service: CategoryService = Depends(get_category_service),
):
    categories = await category_service.get_category_tree()
    return ApiResponse.success(data=categories)


@router.get("/{category_id}", summary="获取分类详情")
async def get_category_detail(
    category_id: int,
    category_service: CategoryService = Depends(get_category_service),
):
    category = await category_service.get_category_by_id(category_id)
    return ApiResponse.success(data=CategoryResponse.model_validate(category))


@router.get("/slug/{slug}", summary="根据别名获取分类")
async def get_category_by_slug(
    slug: str,
    category_service: CategoryService = Depends(get_category_service),
):
    category = await category_service.get_category_by_slug(slug)
    return ApiResponse.success(data=CategoryResponse.model_validate(category))


@router.post("", summary="创建分类")
async def create_category(
    category_in: CategoryCreate,
    current_user: User = Depends(get_current_admin_user),
    category_service: CategoryService = Depends(get_category_service),
):
    category = await category_service.create_category(category_in)
    return ApiResponse.created(
        data=CategoryResponse.model_validate(category),
        message="分类创建成功"
    )


@router.put("/{category_id}", summary="更新分类")
async def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    current_user: User = Depends(get_current_admin_user),
    category_service: CategoryService = Depends(get_category_service),
):
    category = await category_service.update_category(category_id, category_in)
    return ApiResponse.success(
        data=CategoryResponse.model_validate(category),
        message="分类更新成功"
    )


@router.delete("/{category_id}", summary="删除分类")
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_admin_user),
    category_service: CategoryService = Depends(get_category_service),
):
    await category_service.delete_category(category_id)
    return ApiResponse.success(message="分类删除成功")


tag_router = APIRouter(prefix="/tags", tags=["标签"])


@tag_router.get("", summary="获取标签列表")
async def get_tag_list(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    order_by: str = Query("article_count", description="排序字段"),
    order: str = Query("desc", description="排序方式"),
    tag_service: TagService = Depends(get_tag_service),
):
    tags = await tag_service.get_tag_list(
        skip=skip,
        limit=limit,
        order_by=order_by,
        order=order,
    )
    return ApiResponse.success(
        data=[TagResponse.model_validate(t) for t in tags]
    )


@tag_router.get("/popular", summary="获取热门标签")
async def get_popular_tags(
    limit: int = Query(10, ge=1, le=50),
    tag_service: TagService = Depends(get_tag_service),
):
    tags = await tag_service.get_popular_tags(limit=limit)
    return ApiResponse.success(
        data=[TagResponse.model_validate(t) for t in tags]
    )


@tag_router.get("/{tag_id}", summary="获取标签详情")
async def get_tag_detail(
    tag_id: int,
    tag_service: TagService = Depends(get_tag_service),
):
    tag = await tag_service.get_tag_by_id(tag_id)
    return ApiResponse.success(data=TagResponse.model_validate(tag))


@tag_router.get("/slug/{slug}", summary="根据别名获取标签")
async def get_tag_by_slug(
    slug: str,
    tag_service: TagService = Depends(get_tag_service),
):
    tag = await tag_service.get_tag_by_slug(slug)
    return ApiResponse.success(data=TagResponse.model_validate(tag))


@tag_router.post("", summary="创建标签")
async def create_tag(
    tag_in: TagCreate,
    current_user: User = Depends(get_current_admin_user),
    tag_service: TagService = Depends(get_tag_service),
):
    tag = await tag_service.create_tag(tag_in)
    return ApiResponse.created(
        data=TagResponse.model_validate(tag),
        message="标签创建成功"
    )


@tag_router.put("/{tag_id}", summary="更新标签")
async def update_tag(
    tag_id: int,
    tag_in: TagUpdate,
    current_user: User = Depends(get_current_admin_user),
    tag_service: TagService = Depends(get_tag_service),
):
    tag = await tag_service.update_tag(tag_id, tag_in)
    return ApiResponse.success(
        data=TagResponse.model_validate(tag),
        message="标签更新成功"
    )


@tag_router.delete("/{tag_id}", summary="删除标签")
async def delete_tag(
    tag_id: int,
    current_user: User = Depends(get_current_admin_user),
    tag_service: TagService = Depends(get_tag_service),
):
    await tag_service.delete_tag(tag_id)
    return ApiResponse.success(message="标签删除成功")
