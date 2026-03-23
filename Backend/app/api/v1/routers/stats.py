from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from app.schemas.stats import (
    DashboardStats, TrafficResponse, HotArticlesResponse
)
from app.services.stats_service import StatsService
from app.models.user import User
from app.core.dependencies import (
    get_stats_service, get_current_admin_user
)
from app.utils.response import ApiResponse

router = APIRouter(prefix="/stats", tags=["统计"])


@router.get("/dashboard", summary="获取仪表盘统计")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_admin_user),
    stats_service: StatsService = Depends(get_stats_service),
):
    stats = await stats_service.get_dashboard_stats()
    return ApiResponse.success(data=stats)


@router.get("/traffic", summary="获取访问趋势")
async def get_traffic_stats(
    start_date: str = Query(..., description="开始日期，格式: YYYY-MM-DD"),
    end_date: str = Query(..., description="结束日期，格式: YYYY-MM-DD"),
    type: str = Query("day", description="类型: day/week/month"),
    current_user: User = Depends(get_current_admin_user),
    stats_service: StatsService = Depends(get_stats_service),
):
    try:
        start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
        end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
        end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
    except ValueError:
        return ApiResponse.error(message="日期格式错误，请使用 YYYY-MM-DD 格式")
    
    if start_datetime > end_datetime:
        return ApiResponse.error(message="开始日期不能大于结束日期")
    
    traffic = await stats_service.get_traffic_stats(
        start_date=start_datetime,
        end_date=end_datetime,
        stat_type=type
    )
    return ApiResponse.success(data=traffic)


@router.get("/hot-articles", summary="获取热门文章")
async def get_hot_articles(
    limit: int = Query(10, ge=1, le=50, description="数量"),
    type: str = Query("view", description="类型: view/like/comment"),
    start_date: Optional[str] = Query(None, description="开始日期"),
    end_date: Optional[str] = Query(None, description="结束日期"),
    current_user: User = Depends(get_current_admin_user),
    stats_service: StatsService = Depends(get_stats_service),
):
    start_datetime = None
    if start_date:
        try:
            start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
        except ValueError:
            pass
    
    end_datetime = None
    if end_date:
        try:
            end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
        except ValueError:
            pass
    
    hot_articles = await stats_service.get_hot_articles(
        limit=limit,
        sort_type=type,
        start_date=start_datetime,
        end_date=end_datetime
    )
    return ApiResponse.success(data=hot_articles)
